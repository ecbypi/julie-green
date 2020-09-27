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
  assert.ok(julie.limbs.signup.newsletter);
  assert.equal(julie.limbs.signup.newsletter.elements.length, 3);
});

QUnit.module("Appendage(inputElement)");

QUnit.test("Detects validations from HTML attributes", function(assert) {
  var julie = new JulieGreen(document.querySelector("[data-julie-me]"));

  assert.deepEqual(julie.limbs.signup.email.validators, ["required", "pattern"]);
  assert.deepEqual(julie.limbs.signup.password.validators, ["required", "minlength"]);
  assert.deepEqual(julie.limbs.signup.password_confirmation.validators, ["required", "minlength"]);
});

// TODO: Add `readonly` input to fixtures to test here
QUnit.test("Ignores disabled and readonly inputs", function(assert) {
  var julie = new JulieGreen(document.querySelector("[data-julie-me]"));
  var birthdayAppendage = julie.limbs.signup.birthday;

  assert.deepEqual(birthdayAppendage.validators, []);
});
