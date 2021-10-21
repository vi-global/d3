// https://www.jasondavies.com/maps/zoom/
// single map
!(function () {
    function t(t, n, e) {
        var o = t.translate(),
            a = Math.atan2(n[1] - o[1], n[0] - o[0]) - Math.atan2(e[1] - o[1], e[0] - o[0]);
        return [Math.cos(a / 2), 0, 0, Math.sin(a / 2)];
    }
    function n(t, n) {
        var e = t.invert(n);
        return e && isFinite(e[0]) && isFinite(e[1]) && c(e);
    }
    function e(t) {
        var n = 0.5 * t[0] * l,
            e = 0.5 * t[1] * l,
            o = 0.5 * t[2] * l,
            a = Math.sin(n),
            r = Math.cos(n),
            i = Math.sin(e),
            c = Math.cos(e),
            s = Math.sin(o),
            h = Math.cos(o);
        return [r * c * h + a * i * s, a * c * h - r * i * s, r * i * h + a * c * s, r * c * s - a * i * h];
    }
    function o(t, n) {
        var e = t[0],
            o = t[1],
            a = t[2],
            r = t[3],
            i = n[0],
            c = n[1],
            s = n[2],
            h = n[3];
        return [e * i - o * c - a * s - r * h, e * c + o * i + a * h - r * s, e * s - o * h + a * i + r * c, e * h + o * s - a * c + r * i];
    }
    function a(t, n) {
        if (t && n) {
            var e = h(t, n),
                o = Math.sqrt(s(e, e)),
                a = 0.5 * Math.acos(Math.max(-1, Math.min(1, s(t, n)))),
                r = Math.sin(a) / o;
            return o && [Math.cos(a), e[2] * r, -e[1] * r, e[0] * r];
        }
    }
    function r(t, n) {
        var e = Math.max(-1, Math.min(1, s(t, n))),
            o = 0 > e ? -1 : 1,
            a = Math.acos(o * e),
            r = Math.sin(a);
        return r
            ? function (e) {
                  var i = (o * Math.sin((1 - e) * a)) / r,
                      c = Math.sin(e * a) / r;
                  return [t[0] * i + n[0] * c, t[1] * i + n[1] * c, t[2] * i + n[2] * c, t[3] * i + n[3] * c];
              }
            : function () {
                  return t;
              };
    }
    function i(t) {
        return [
            Math.atan2(2 * (t[0] * t[1] + t[2] * t[3]), 1 - 2 * (t[1] * t[1] + t[2] * t[2])) * f,
            Math.asin(Math.max(-1, Math.min(1, 2 * (t[0] * t[2] - t[3] * t[1])))) * f,
            Math.atan2(2 * (t[0] * t[3] + t[1] * t[2]), 1 - 2 * (t[2] * t[2] + t[3] * t[3])) * f,
        ];
    }
    function c(t) {
        var n = t[0] * l,
            e = t[1] * l,
            o = Math.cos(e);
        return [o * Math.cos(n), o * Math.sin(n), Math.sin(e)];
    }
    function s(t, n) {
        for (var e = 0, o = t.length, a = 0; o > e; ++e) a += t[e] * n[e];
        return a;
    }
    function h(t, n) {
        return [t[1] * n[2] - t[2] * n[1], t[2] * n[0] - t[0] * n[2], t[0] * n[1] - t[1] * n[0]];
    }
    function u(t) {
        for (var n = 0, e = arguments.length, o = []; ++n < e; ) o.push(arguments[n]);
        var a = d3.dispatch.apply(null, o);
        return (
            (a.of = function (n, e) {
                return function (o) {
                    try {
                        var r = (o.sourceEvent = d3.event);
                        (o.target = t), (d3.event = o), a[o.type].apply(n, e);
                    } finally {
                        d3.event = r;
                    }
                };
            }),
            a
        );
    }
    var l = Math.PI / 180,
        f = 180 / Math.PI;
    d3.geo.zoom = function () {
        function s(t) {
            m++ || t({ type: "zoomstart" });
        }
        function h(t) {
            t({ type: "zoom" });
        }
        function l(t) {
            --m || t({ type: "zoomend" });
        }
        var f,
            d,
            M,
            m = 0,
            v = u(p, "zoomstart", "zoom", "zoomend"),
            p = d3.behavior
                .zoom()
                .on("zoomstart", function () {
                    var r = d3.mouse(this),
                        c = e(f.rotate()),
                        u = n(f, r);
                    u && (M = u),
                        g.call(p, "zoom", function () {
                            f.scale((z.k = d3.event.scale));
                            var e = d3.mouse(this),
                                s = a(M, n(f, e));
                            f.rotate((z.r = i((c = s ? o(c, s) : o(t(f, r, e), c))))), (r = e), h(v.of(this, arguments));
                        }),
                        s(v.of(this, arguments));
                })
                .on("zoomend", function () {
                    g.call(p, "zoom", null), l(v.of(this, arguments));
                }),
            g = p.on,
            z = { r: [0, 0, 0], k: 1 };
        return (
            (p.rotateTo = function (t) {
                var n = a(c(t), c([-z.r[0], -z.r[1]]));
                return i(o(e(z.r), n));
            }),
            (p.projection = function (t) {
                return arguments.length ? ((f = t), (z = { r: f.rotate(), k: f.scale() }), p.scale(z.k)) : f;
            }),
            (p.duration = function (t) {
                return arguments.length ? ((d = t), p) : d;
            }),
            (p.event = function (t) {
                t.each(function () {
                    var t = d3.select(this),
                        n = v.of(this, arguments),
                        o = z,
                        a = d3.transition(t);
                    if (a !== t) {
                        a.each("start.zoom", function () {
                            this.__chart__ && (z = this.__chart__), f.rotate(z.r).scale(z.k), s(n);
                        })
                            .tween("zoom:zoom", function () {
                                var t = p.size()[0],
                                    c = r(e(z.r), e(o.r)),
                                    s = d3.geo.distance(z.r, o.r),
                                    u = d3.interpolateZoom([0, 0, t / z.k], [s, 0, t / o.k]);
                                return (
                                    d && a.duration(d(0.001 * u.duration)),
                                    function (e) {
                                        var o = u(e);
                                        (this.__chart__ = z = { r: i(c(o[0] / s)), k: t / o[2] }), f.rotate(z.r).scale(z.k), p.scale(z.k), h(n);
                                    }
                                );
                            })
                            .each("end.zoom", function () {
                                l(n);
                            });
                        try {
                            a.each("interrupt.zoom", function () {
                                l(n);
                            });
                        } catch (c) {}
                    } else (this.__chart__ = z), s(n), h(n), l(n);
                });
            }),
            d3.rebind(p, v, "on")
        );
    };
})(),
    (function () {
        function t(t) {
            return {
                moveTo: function (n, o) {
                    t.moveTo(Math.round(n * e), Math.round(o * e));
                },
                lineTo: function (n, o) {
                    t.lineTo(Math.round(n * e), Math.round(o * e));
                },
                closePath: function () {
                    t.closePath();
                },
            };
        }
        var n = 180 / Math.PI,
            e = window.devicePixelRatio || 1,
            o = 960,
            a = 500,
            r = e,
            i = d3.geo
                .orthographic()
                .rotate([0, -30])
                .scale(a / 2 - 1)
                .translate([o / 2, a / 2])
                .clipExtent([
                    [-r, -r],
                    [o + r, a + r],
                ])
                .precision(0.5),
            c = d3
                .select("#map")
                .append("canvas")
                .attr("width", o * e)
                .attr("height", a * e)
                .style("width", o + "px")
                .style("height", a + "px"),
            s = c.node().getContext("2d"),
            h = d3.geo.path().projection(i).context(t(s)),
            u = d3
                .select("#north-up")
                .on("change", function () {
                    u = this.checked;
                })
                .property("checked");
        d3.json("../world-110m.json", function (t, r) {
            function l() {
                f(i, p[(g = ((z = g) + 1) % p.length)]), c.transition().ease("quad-in-out").duration(2e3).call(y.projection(i).event);
            }
            function f(t, n) {
                var e = d3.geo.centroid(n),
                    r = t.clipExtent();
                t.rotate(u ? [-e[0], -e[1]] : y.rotateTo(e))
                    .clipExtent(null)
                    .scale(1)
                    .translate([0, 0]);
                var i = h.bounds(n),
                    c = Math.min(1e3, 0.45 / Math.max(Math.max(Math.abs(i[1][0]), Math.abs(i[0][0])) / o, Math.max(Math.abs(i[1][1]), Math.abs(i[0][1])) / a));
                t.clipExtent(r)
                    .scale(c)
                    .translate([o / 2, a / 2]);
            }
            var d = { type: "Sphere" },
                M = d3.geo.graticule()(),
                m = topojson.feature(r, r.objects.land),
                v = topojson.mesh(r, r.objects.countries),
                p = d3.shuffle(topojson.feature(r, r.objects.countries).features),
                g = -1,
                z = g,
                y = d3.geo
                    .zoom()
                    .projection(i)
                    .duration(function (t) {
                        return 2e3 * Math.sqrt(t);
                    })
                    .scaleExtent([a / 2 - 1, 1 / 0])
                    .on("zoom", function () {
                        i.clipAngle(Math.asin(Math.min(1, (0.5 * Math.sqrt(o * o + a * a)) / i.scale())) * n),
                            s.clearRect(0, 0, o * e, a * e),
                            (s.strokeStyle = "#999"),
                            (s.lineWidth = 0.25 * e),
                            s.beginPath(),
                            h(M),
                            s.stroke(),
                            (s.fillStyle = "#69d2e7"),
                            s.beginPath(),
                            h(m),
                            s.fill(),
                            (s.fillStyle = "#f00"),
                            s.beginPath(),
                            h(p[z]),
                            s.fill(),
                            (s.fillStyle = "#f00"),
                            s.beginPath(),
                            h(p[g]),
                            s.fill(),
                            (s.strokeStyle = "#fff"),
                            (s.lineWidth = 0.5 * e),
                            s.beginPath(),
                            h(v),
                            s.stroke(),
                            (s.strokeStyle = "#000"),
                            (s.lineWidth = 0.5 * e),
                            s.beginPath(),
                            h(d),
                            s.stroke();
                    })
                    .on("zoomend", l);
            c.call(y).call(y.event);
        });
    })();
