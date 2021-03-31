<script lang="ts">
import { Vue } from "vue-property-decorator";
import { Num } from "@/common/formatter";

export default Vue.extend({
  props: {
    dec: {
      type: Number,
      default: 6,
    },
    sym: String,
    prepend: String,
    bounded: Boolean,
  },
  render(h) {
    if (!this.$slots.default) {
      return h("span");
    }

    const numStr = (this.$slots.default[0].text || "").trim();
    const parts = splitNum(numStr, this.dec);
    let mantissa = parts[1];
    for (mantissa; ; ) {
      const lastDigit = mantissa[mantissa.length - 1];
      if (lastDigit === "0") {
        mantissa = mantissa.substring(0, mantissa.length - 1);
      } else {
        break;
      }
    }

    let children = [
      h("span", {
        style: {},
        domProps: {
          innerText: parts[0],
        },
      }),
    ];
    if (mantissa !== ".") {
      children.push(
        h("span", {
          style: {
            "font-size": "90%",
            color: "grey",
          },
          domProps: {
            innerText: mantissa,
          },
        })
      );
    }
    if (this.prepend) {
      children.unshift(
        h("span", {
          domProps: {
            innerText: this.prepend,
          },
        })
      );
    }
    if (this.sym) {
      let unitChildren = [];
      if (this.bounded) {
        unitChildren.push(
          h("i", {
            class: "mdi mdi-lock mr-1",
          })
        );
      }

      unitChildren.push(h("span", { domProps: { innerText: this.sym } }));
      children.push(
        h(
          "span",
          {
            style: {
              "font-size": "70%",
              opacity: 0.8,
              "margin-left": "3px",
              "white-space": "pre",
              "font-family": '"Roboto Mono", monospace',
              "padding-left": "3px",
            },
          },
          unitChildren
        )
      );
    }

    return h(
      "div",
      {
        attrs: this.$attrs,
        on: this.$listeners,
        style: {
          display: "inline-block",
          // 'font-family': '"Roboto Mono", monospace'
        },
      },
      children
    );
  },
});

// split number string into integer part and decimal part
function splitNum(numStr: string | null, decimal: number) {
  if (!numStr) {
    return ["--", ".--"];
  }
  numStr = Num.formatBalance(numStr, decimal);
  if (numStr === "NaN") {
    return ["--", ".--"];
  }
  const dp = numStr.indexOf(".");
  if (dp >= 0) {
    return [numStr.slice(0, dp), numStr.slice(dp)];
  } else {
    return [numStr, ""];
  }
}
</script>
