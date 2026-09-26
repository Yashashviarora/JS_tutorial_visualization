function a() {
  var x = 0,
    z = 10;
  return function b() {
    debugger; // browser pauses here — now inspect x and z in the Console
    console.log(x);
  };
}

var y = a();
// ...

y();
