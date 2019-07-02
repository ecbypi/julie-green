QUnit.test("Exists", function(assert) {
  assert.ok(JulieGreen, "Exists on window");

  var formElement = document.querySelector("[data-julie-me]");

  var julie = new JulieGreen(formElement);

  assert.ok(julie.form, "tracks form");
  assert.ok(julie.inputs, "tracks inputs");
});
