// const rewire = require("rewire")
// const javascript = rewire("../src/index")

const process = require('../src/index')

var result = process({"names": ["Barney","Rubble"]})

test("hello barney (src)", () =>
  {
    expect( result.Barney )
      .toBe("Welcome to Knowledge Grid, Barney")
  })

test("hello rubble (src)", () =>
  {
    expect( result.Rubble )
      .toBe("Welcome to Knowledge Grid, Rubble")
  })

