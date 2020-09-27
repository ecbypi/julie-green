QUnit.test("`JulieGreen` is registered on the window", function(assert) {
  assert.ok(JulieGreen, "Exists on window");
});

QUnit.module("JulieGreen(formElement)");

QUnit.test("Creates object structure corresponding to form's input names", function(assert) {
  var julie = new JulieGreen(document.querySelector("[data-julie-me]"));

  assert.ok(julie.limbs.signup);
  assert.ok(julie.limbs.signup.email);
  assert.ok(julie.limbs.signup.password);
  assert.ok(julie.limbs.signup.password_confirmation);

  // Check that inputs with the same name are tracked in one appendage
  assert.ok(julie.limbs.signup.newsletter);
  assert.equal(julie.limbs.signup.newsletter.elements.length, 3);

  // Check inputs representing an array are correctly parsed as arrays
  assert.equal(julie.limbs.signup.phone_numbers.length, 2);
  assert.ok(julie.limbs.signup.phone_numbers[0].type);
  assert.ok(julie.limbs.signup.phone_numbers[0].value);
  assert.ok(julie.limbs.signup.phone_numbers[1].type);
  assert.ok(julie.limbs.signup.phone_numbers[1].value);
});

QUnit.module("Appendage(inputElement)");

QUnit.test("Detects validations from HTML attributes", function(assert) {
  var julie = new JulieGreen(document.querySelector("[data-julie-me]"));

  assert.deepEqual(julie.limbs.signup.email.validators, ["required", "pattern"]);
  assert.deepEqual(julie.limbs.signup.password.validators, ["required", "minlength"]);
  assert.deepEqual(julie.limbs.signup.password_confirmation.validators, ["required", "minlength"]);

  // Collection input, the validator is detected from the `<fieldset>` grouping the elements
  assert.deepEqual(julie.limbs.signup.language.validators, ["required"]);
});

// TODO: Add `readonly` input to fixtures to test here
QUnit.test("Ignores disabled and readonly inputs", function(assert) {
  var julie = new JulieGreen(document.querySelector("[data-julie-me]"));
  var birthdayAppendage = julie.limbs.signup.birthday;
  var newsletterAppendage = julie.limbs.signup.newsletter;

  // Simple inputs with `disabled` are ignored
  assert.deepEqual(birthdayAppendage.validators, []);

  // For collection inputs in a `<fieldset>`, the `disabled` attribute on the `<fieldset>` will
  // cause validations to be skipped
  assert.deepEqual(newsletterAppendage.validators, []);
});
