'use babel';

import {
  CompositeDisposable,
  Disposable,
  Point,
  Range,
} from 'atom';

export default {

  config: {
    rules: {
      type: 'array',
      default: [],
      items: {
        type: 'string'
      }
    }
  },

  subscriptions: null,

  activate(state) {
    this.disposeHabitBuffer = this.disposeHabitBuffer.bind(this);
    this.handleText = this.handleText.bind(this);
    this.changeTextEditor = this.changeTextEditor.bind(this);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Initial rules load
    const rules = atom.config.get('atom-habit.rules');
    this.ruleMap = {};
    this.loadRules(rules);

    // Habit buffer
    this.habitBuffer = '';

    // Register for editor events
    this.subscriptions.add(atom.workspace.observeTextEditors(this.changeTextEditor));
    this.subscriptions.add(new Disposable(this.disposeHabitBuffer));
  },

  changeTextEditor(editor) {
    this.buffer = editor.getBuffer();
    // Register for buffer change events
    this.subscriptions.add(this.buffer.onDidChangeText(this.handleText));
    this.disposeHabitBuffer();
  },

  loadRules(rules) {
    this.ruleMap = rules.reduce((ruleMap, rule) => {
      const regex = rule.split('/', 1)[0];
      const sub = rule.slice(regex.length + 1);
      ruleMap[regex] = sub;
      return ruleMap;
    }, {});
  },

  disposeHabitBuffer() {
    this.habitBuffer = '';
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  handleText({changes}) {
    changes.forEach((change) => {
      this.habitBuffer = (this.habitBuffer + change.newText).slice(-255);

      Object.keys(this.ruleMap).forEach((regex) => {
        const match = this.habitBuffer.match(regex + '$');

        if (match) {
          const sub = this.ruleMap[regex];
          const changePoint = new Point(
            change.start.row
              + (change.newExtent.row - change.oldExtent.row),
            change.start.column
              + (change.newExtent.column - change.oldExtent.column)
          );
          const matchPoint = new Point(
            changePoint.row,
            changePoint.column - match[0].length,
          );
          const subRange = new Range(matchPoint, changePoint);
          this.buffer.setTextInRange(subRange, sub);
        }
      });
    });
  },

};
