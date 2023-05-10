export const theme = {
  name: "sqlillo",
  rounding: 2,
  spacing: 24,
  defaultMode: "light",
  global: {
    colors: {
      brand: {
        light: "#7230FF",
        dark: "#7230FF",
      },
      "brand-tertiary": {
        light: "rgba(250,125,147,1)",
        dark: "rgba(250,125,147,1)",
      },
      background: {
        light: "#FFFFFF",
        dark: "#202124",
      },
      "background-back": {
        light: "#EEEEEE",
        dark: "#202124",
      },
      "background-front": {
        light: "#FFFFFF",
        dark: "#26272a",
      },
      "background-contrast": {
        light: "#11111111",
        dark: "#6662",
      },
      text: {
        dark: "#EEEEEE",
        light: "#202124",
      },
      "text-strong": {
        dark: "#FFFFFF",
        light: "#000000",
      },
      "text-weak": {
        dark: "#CCCCCC",
        light: "#444444",
      },
      "text-xweak": {
        dark: "#999999",
        light: "#666666",
      },
      border: {
        dark: "#444444",
        light: "#CCCCCC",
      },
      control: "brand",
      "active-background": "background-contrast",
      "active-text": "text-strong",
      "selected-background": "brand",
      "selected-text": "text-strong",
      "status-critical": "#FF4040",
      "status-warning": "#FFAA15",
      "status-ok": "#00C781",
      "status-unknown": "#CCCCCC",
      "status-disabled": "#CCCCCC",
      "graph-0": "brand-secondary",
      "graph-1": "brand",
      "brand-secondary": {
        dark: "#F47E59",
        light: "#F47E59",
      },
      "brand-secondary!": "",
      focus: {
        light: "brand-secondary",
        dark: "brand-secondary",
      },
    },
    font: {
      family: '"Kumbh Sans"',
      face: "/* math */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYwir7vYko.woff2) format('woff2');\n  unicode-range: U+0302-0303, U+0305, U+0307-0308, U+0330, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2034-2037, U+2057, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2102, U+210A-210E, U+2110-2112, U+2115, U+2119-211D, U+2124, U+2128, U+212C-212D, U+212F-2131, U+2133-2138, U+213C-2140, U+2145-2149, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B6, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF;\n}\n/* latin-ext */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYw-L7vYko.woff2) format('woff2');\n  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYw9r7v.woff2) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n\n/* math */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYwir7vYko.woff2) format('woff2');\n  unicode-range: U+0302-0303, U+0305, U+0307-0308, U+0330, U+0391-03A1, U+03A3-03A9, U+03B1-03C9, U+03D1, U+03D5-03D6, U+03F0-03F1, U+03F4-03F5, U+2034-2037, U+2057, U+20D0-20DC, U+20E1, U+20E5-20EF, U+2102, U+210A-210E, U+2110-2112, U+2115, U+2119-211D, U+2124, U+2128, U+212C-212D, U+212F-2131, U+2133-2138, U+213C-2140, U+2145-2149, U+2190, U+2192, U+2194-21AE, U+21B0-21E5, U+21F1-21F2, U+21F4-2211, U+2213-2214, U+2216-22FF, U+2308-230B, U+2310, U+2319, U+231C-2321, U+2336-237A, U+237C, U+2395, U+239B-23B6, U+23D0, U+23DC-23E1, U+2474-2475, U+25AF, U+25B3, U+25B7, U+25BD, U+25C1, U+25CA, U+25CC, U+25FB, U+266D-266F, U+27C0-27FF, U+2900-2AFF, U+2B0E-2B11, U+2B30-2B4C, U+2BFE, U+FF5B, U+FF5D, U+1D400-1D7FF, U+1EE00-1EEFF;\n}\n/* latin-ext */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYw-L7vYko.woff2) format('woff2');\n  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Kumbh Sans';\n  font-style: normal;\n  font-weight: 400;\n  src: url(https://fonts.gstatic.com/s/kumbhsans/v20/c4mP1n92AsfhuCq6tVsaoIx1LQICk0boNoq0SjlDfnzKo-bF3mdQkZYw9r7v.woff2) format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;\n}\n",
    },
    active: {
      background: "active-background",
      color: "active-text",
    },
    hover: {
      background: "active-background",
      color: "active-text",
    },
    selected: {
      background: "selected-background",
      color: "selected-text",
    },
    control: {
      border: {
        radius: "2px",
      },
    },
    drop: {
      border: {
        radius: "2px",
      },
    },
  },
  chart: {},
  diagram: {
    line: {},
  },
  meter: {},
  tip: {
    content: {
      background: {
        color: "background",
      },
      elevation: "none",
      round: false,
    },
  },
  button: {
    border: {
      radius: "2px",
    },
  },
  checkBox: {
    check: {
      radius: "2px",
    },
    toggle: {
      radius: "2px",
    },
  },
  radioButton: {
    check: {
      radius: "2px",
    },
  },
  formField: {
    border: {
      color: "border",
      error: {
        color: {
          dark: "white",
          light: "status-critical",
        },
      },
      position: "inner",
      side: "bottom",
    },
    content: {
      pad: "small",
    },
    disabled: {
      background: {
        color: "status-disabled",
        opacity: "medium",
      },
    },
    error: {
      color: "status-critical",
      margin: {
        vertical: "xsmall",
        horizontal: "small",
      },
    },
    help: {
      color: "dark-3",
      margin: {
        start: "small",
      },
    },
    info: {
      color: "text-xweak",
      margin: {
        vertical: "xsmall",
        horizontal: "small",
      },
    },
    label: {
      margin: {
        vertical: "xsmall",
        horizontal: "small",
      },
    },
    margin: {
      bottom: "small",
    },
    survey: {
      label: {
        margin: {
          bottom: "xsmall",
        },
        size: "medium",
        weight: 400,
      },
    },
    round: "2px",
  },
  heading: {
    font: {
      family: '"Kumbh Sans"',
    },
  },
};
