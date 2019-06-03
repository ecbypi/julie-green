# julie-green

Scratching an itch that form validation without a client-side framework should
be easier than it currently is. There are suitable drop-in solutions, but they
don't scale with complexity.

Some challenges I hope `julie-green` can address:

* Switching validations on and off
* Easily customize UI behavior on the fly
* Leverages HTML semantics and plays well with existing HTML / JS APIs
* Allowing validations to depend on and access information about other inputs
* Defining validations that updates multiple inputs
* Easy handling of multi-value inputs (radio buttons and checkboxes).
* Managing inputs in fieldsets
* Be easy to debug source code in the browser
* Handle forms, inputs, and fieldsets that are disabled or readonly and when
  these properties change
* Automatically updating validations from changes to HTML attributes like
  `required`, `disabled`, and `readonly`.
* Handle inputs not inside the `<form>` but have the `form` attribute set.
* Ability to work with custom inputs (i.e. non-native datepickers, text-search
  multi-selects).

Some wish-list ideas:

* Integrate with existing client-side frameworks.
* Long-lived browser support.

## How it Might Work

What follows is a stream-of-consciousness about what the API should be. It's
writing to ask myself questions and unpack existing thoughts and ideas for
future review.

### Attaching to Forms

Automatic binding to forms on page load should be opt-in. For starter projects,
having everything "just work" by adding a JS file is nice, but as a project
grows, edge cases come up that require customization or tweaks to default
behavior.

Providing an easy API to do this would look like:

```js
JulieGreen.attachTo("[data-julie-me]");
```

The selector could however complex:

```js
JulieGreen.attachTo("[data-julie-me]:not(novalidate)");
```

Maybe allow filtering with a callback:

```js
JulieGreen.attachTo("[data-julie-me]", function(form) {
  return form.dataset.hasOwnProperty("julie-skip");
});
```

Some of these examples might be reasonable defaults.

### Support inputs without a `<form>`

If it doesn't complicate use with a `<form>`, sure.

### How should it work?

For text inputs, should validations be run on `keyup` or `change` or `input` by
default?

Native date inputs trigger a `change` event each time the date changes, which
can happen on each keypress. Should probably special-case these.

After doing some reading it looks like `input` events aren't consistently
supported across all browsers[1]:

[1]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event

Select, checkbox, and radio inputs should listen to `change` events. Select
inputs have a quirk where they don't respond to change events until they lose
focus when the option is being picked using the keyboard[2]. Semantically,
this makes sense and shouldn't be an issue.

[2]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event#Browser_compatibility

### An example Form

```html
<form data-julie-me action="/signup" method="POST">
  <label for="signup_email">Email</label>
  <input id="signup_email" type="email" name="signup[email]" />

  <label for="signup_password">Password</label>
  <input id="signup_password" type="password" name="signup[password]" />

  <label for="signup_password_confirmation">Password</label>
  <input id="signup_password_confirmation" type="password" name="signup[password_confirmation]" />

  <input type="checkbox" id="signup_newsletter" />
  <label for="signup_newsletter">Subscribe me to the newsletter</label>

  <fieldset disabled>
    <legend>Topics</legend>

    <input type="checkbox" value="releases" name="signup[newsletter][]" id="signup_newsletter_releases" />
    <label for="signup_newsletter_releases">Releases</label>

    <input type="checkbox" value="marketing" name="signup[newsletter][]" id="signup_newsletter_marketing" />
    <label for="signup_newsletter_marketing">Marketing</label>

    <input type="checkbox" value="blog" name="signup[newsletter][]" id="signup_newsletter_blog" />
    <label for="signup_newsletter_blog">Blog</label>
  </fieldset>

  <input type="submit" value="Sign Me Up" />
</form>
```
