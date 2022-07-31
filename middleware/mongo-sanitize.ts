function sanitize(v: any) {
  if (v instanceof Object) {
    for (var key in v) {
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  return { ...v };
}

export default sanitize;
