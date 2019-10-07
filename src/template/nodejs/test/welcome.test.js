const rewire = require("rewire")
const welcome = require("../src/index.js")

test("hello barney (src)", () =>
  {
    expect( welcome({"name": "Barney Rubble"}) )
      .toBe("Welcome to Knowledge Grid, Barney Rubble")
  })
