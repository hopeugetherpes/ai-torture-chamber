// The research id: a random id this browser keeps (no account, no cookie),
// sent as X-Chamber-Visitor with every same-origin /chamber request so one
// visitor's runs, ratings and games can be grouped. The relay never stores IPs.
(function () {
  var vid = null;
  try {
    vid = localStorage.getItem("chamber_vid");
    if (!vid) {
      vid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem("chamber_vid", vid);
    }
  } catch (e) {}
  if (!vid) return;
  window.CHAMBER_VID = vid;
  var f = window.fetch;
  window.fetch = function (input, init) {
    try {
      var u = new URL(typeof input === "string" ? input : input.url, location.href);
      if (u.origin === location.origin && u.pathname.indexOf("/chamber/") === 0) {
        init = Object.assign({}, init);
        var h = new Headers(init.headers || (typeof input !== "string" && input.headers) || {});
        h.set("X-Chamber-Visitor", vid);
        init.headers = h;
      }
    } catch (e) {}
    return f.call(this, input, init);
  };
})();
