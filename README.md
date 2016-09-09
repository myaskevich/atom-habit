# atom-habit package

Atom plugin to help you avoid diverting from your typing habits and be a happier person.

![A screenshot of your package](https://media.giphy.com/media/l3vRgmOkqsB2SnNeM/giphy.gif)

## Configuration

Add custom rules to your `config.cson` like this:

```
"*":
  "atom-habit":
    rules: [
      "const\\s/let "
    ]
```

### Rule syntax

Rule is a plain sed-like string. You define trigger regex on the left to `/` and substitute regex on the right.

    "${TRIGGER_REGEX}/${SUBSTITUTE_REGEX}"

**Note:** Currently you have to manually escape all what needs to be escaped.
