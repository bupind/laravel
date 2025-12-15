"use strict";
var KTPasswordResetNewPassword = (function () {
  var e,
    t,
    r,
    o,
    s = function () {
      return 100 === o.getScore();
    };
  return {
    init: function () {
      (e = document.querySelector("#kt_new_password_form")),
        (o = KTPasswordMeter.getInstance(
          e.querySelector('[data-kt-password-meter="true"]')
        )),
        (r = FormValidation.formValidation(e, {
          fields: {
            password: {
              validators: {
                notEmpty: { message: "The password is required" },
                callback: {
                  message: "Please enter valid password",
                  callback: function (e) {
                    if (e.value.length > 0) return s();
                  },
                },
              },
            },
            "confirm-password": {
              validators: {
                notEmpty: { message: "The password confirmation is required" },
                identical: {
                  compare: function () {
                    return e.querySelector('[name="password"]').value;
                  },
                  message: "Las contraseñas no coinciden",
                },
              },
            },
            toc: {
              validators: {
                notEmpty: {
                  message: "You must accept the terms and conditions",
                },
              },
            },
          },
          plugins: {
            trigger: new FormValidation.plugins.Trigger({
              event: { password: !1 },
            }),
            bootstrap: new FormValidation.plugins.Bootstrap5({
              rowSelector: ".fv-row",
              eleInvalidClass: "",
              eleValidClass: "",
            }),
          },
        })),
        e
          .querySelector('input[name="password"]')
          .addEventListener("input", function () {
            this.value.length > 0 &&
              r.updateFieldStatus("password", "NotValidated");
          });
    },
  };
})();
KTUtil.onDOMContentLoaded(function () {
  KTPasswordResetNewPassword.init();
});
