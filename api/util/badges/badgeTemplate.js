function badgeTemplate ({
  logoColor = '#fff',
  backgroundColor = '#B2B4BD',
  textColor = '#5C5C5C',
  description = [],
  header,
  icon,
  title
}) {
  return `
<svg width="160" height="91" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M0 3C0 1.34315 1.34315 0 3 0H157C158.657 0 160 1.34315 160 3V30H0V3Z"
    fill="${header.background}"
  />
  <path
    d="M160 58C160 59.6569 158.657 61 157 61L3 61C1.34315 61 -1.17422e-07 59.6569 -2.62268e-07 58L-5.33279e-06 1.39876e-05L160 0L160 58Z"
    transform="translate(0,30)"
    fill="${backgroundColor}"
  />
  <g fill="${logoColor}" transform="translate(30,70)">
    <path d="M99.9999 0H93.9998V13.3513H99.9999V0Z" />
    <path d="M0 4.32391H1.56527V4.80839C1.69605 4.61297 1.87372 4.45344 2.08206 4.34439C2.29039 4.23534 2.52273 4.18025 2.75785 4.18415C3.00562 4.1628 3.25446 4.21075 3.47657 4.32262C3.69868 4.4345 3.88531 4.60591 4.01565 4.81771C4.18427 4.61423 4.39674 4.45153 4.63716 4.34181C4.87757 4.23209 5.1397 4.17819 5.4039 4.18415C6.3356 4.18415 6.89463 4.76181 6.89463 6.16869V11.2838H5.31072V6.48547C5.31072 5.90781 5.12438 5.64693 4.78897 5.64693C4.45355 5.64693 4.19268 5.90781 4.19268 6.48547V11.2838H2.64604V6.48547C2.64604 5.90781 2.45039 5.64693 2.12429 5.64693C1.79819 5.64693 1.53732 5.90781 1.53732 6.48547V11.2838H0V4.32391Z" />
    <path d="M8.38538 7.7893C8.38538 5.46935 9.80157 4.18359 11.6277 4.18359C13.4539 4.18359 14.7396 5.51593 14.7396 7.91042C14.7489 8.07178 14.7489 8.23354 14.7396 8.3949H10.1836C10.1834 8.59791 10.2242 8.79886 10.3036 8.98572C10.3829 9.17259 10.4991 9.34153 10.6452 9.48245C10.7914 9.62336 10.9644 9.73335 11.154 9.80583C11.3437 9.87831 11.546 9.91179 11.7488 9.90427C12.4039 9.89811 13.0461 9.7215 13.6122 9.39183L14.3017 10.7149C13.4854 11.2099 12.5449 11.462 11.5904 11.4416C9.73635 11.4323 8.38538 10.1186 8.38538 7.7893ZM13.0439 7.1371C12.9507 6.2054 12.5967 5.64637 11.6277 5.64637C10.8264 5.64637 10.3606 6.19608 10.2581 7.1371H13.0439Z" />
    <path d="M16.1653 4.32318H18.0287V5.13377C18.2513 4.85061 18.5338 4.62022 18.856 4.45914C19.1782 4.29805 19.532 4.21026 19.8921 4.20206C20.4262 4.14446 20.9647 4.25869 21.4294 4.52816L20.8331 6.39157C20.4719 6.05498 19.9944 5.87133 19.5008 5.87913C18.6343 5.87913 18.0939 6.54064 18.0939 7.57484V11.2551H16.2305L16.1653 4.32318Z" />
    <path d="M22.7803 2.38576C22.8063 2.09606 22.9397 1.82657 23.1544 1.6303C23.3691 1.43403 23.6494 1.3252 23.9403 1.3252C24.2311 1.3252 24.5114 1.43403 24.7261 1.6303C24.9408 1.82657 25.0742 2.09606 25.1002 2.38576C25.0742 2.67547 24.9408 2.94496 24.7261 3.14123C24.5114 3.33749 24.2311 3.44633 23.9403 3.44633C23.6494 3.44633 23.3691 3.33749 23.1544 3.14123C22.9397 2.94496 22.8063 2.67547 22.7803 2.38576ZM22.9852 9.28039V4.35166H24.8487V8.95429C24.8487 9.62512 25.212 9.82078 25.7058 9.82078C26.1579 9.82437 26.6056 9.73229 27.0195 9.55058L26.7121 11.0506C26.195 11.277 25.6368 11.3943 25.0723 11.3954C24.7842 11.4339 24.491 11.4046 24.2163 11.3096C23.9416 11.2147 23.6929 11.0568 23.4901 10.8485C23.2873 10.6403 23.136 10.3875 23.0483 10.1104C22.9607 9.83323 22.9391 9.53942 22.9852 9.25244V9.28039Z" />
    <path d="M27.6718 7.7893C27.6329 7.31708 27.6951 6.84201 27.8542 6.3957C28.0133 5.9494 28.2656 5.54211 28.5944 5.20096C28.9232 4.85981 29.321 4.59263 29.7611 4.41721C30.2012 4.24178 30.6737 4.16215 31.147 4.1836C31.653 4.16423 32.1565 4.2647 32.6163 4.4768C33.0761 4.6889 33.4793 5.00664 33.7931 5.40413L32.5353 6.53149C32.3859 6.2803 32.1728 6.07304 31.9176 5.93069C31.6623 5.78835 31.374 5.71598 31.0818 5.72091C30.1501 5.72091 29.5818 6.5874 29.5818 7.7893C29.5818 8.9912 30.0942 9.867 31.147 9.867C31.4584 9.84952 31.7615 9.76059 32.033 9.6071C32.3044 9.4536 32.5368 9.23967 32.7123 8.98188L33.8397 10.1186C33.5144 10.55 33.0915 10.8982 32.6056 11.1347C32.1198 11.3711 31.5848 11.4891 31.0445 11.4789C29.1066 11.4323 27.6718 10.1186 27.6718 7.7893Z" />
    <path d="M34.4731 7.79865C34.4731 5.38553 35.9266 4.17432 37.7341 4.17432C39.5416 4.17432 41.0044 5.37622 41.0044 7.7707C41.0044 10.1652 39.5509 11.4044 37.7341 11.4044C35.9173 11.4044 34.4731 10.1838 34.4731 7.79865ZM39.0758 7.79865C39.0758 6.38246 38.5633 5.7489 37.7248 5.7489C36.8863 5.7489 36.3831 6.38246 36.3831 7.79865C36.3831 9.21485 36.8956 9.86704 37.7248 9.86704C38.554 9.86704 39.1317 9.1869 39.1317 7.79865H39.0758Z" />
    <path d="M48.1972 12.5035H46.427V11.283C45.489 11.139 44.6298 10.6748 43.9952 9.96926L45.1133 8.6835C45.5374 9.16586 46.085 9.52343 46.6972 9.7177V7.32321C44.9176 6.65238 44.2188 5.93497 44.2188 4.52809C44.2084 3.91127 44.4293 3.31288 44.838 2.85075C45.2466 2.38861 45.8135 2.09622 46.427 2.03112V0.80127H48.2065V2.04976C48.9939 2.18158 49.7151 2.57165 50.2563 3.15849L49.101 4.47219C48.7821 4.09897 48.3755 3.81083 47.9177 3.63366V5.83248C49.6507 6.51263 50.3774 7.23936 50.3774 8.6276C50.4034 9.25024 50.1948 9.85996 49.7928 10.3361C49.3908 10.8123 48.8247 11.1203 48.2065 11.1991L48.1972 12.5035ZM46.6879 3.59639C46.5031 3.63609 46.3386 3.74056 46.2242 3.89092C46.1097 4.04128 46.0527 4.22762 46.0636 4.41629C46.053 4.61946 46.1092 4.82052 46.2236 4.98876C46.338 5.157 46.5043 5.28317 46.6972 5.348L46.6879 3.59639ZM47.9177 9.7177C48.1036 9.64647 48.2618 9.51758 48.3691 9.34991C48.4764 9.18225 48.5272 8.98462 48.514 8.78599C48.5272 8.58736 48.4764 8.38974 48.3691 8.22207C48.2618 8.0544 48.1036 7.92551 47.9177 7.85428V9.7177Z" />
    <path d="M48.1972 12.5035H46.427V11.283C45.489 11.139 44.6298 10.6748 43.9952 9.96926L45.1133 8.6835C45.5374 9.16586 46.085 9.52343 46.6972 9.7177V7.32321C44.9176 6.65238 44.2188 5.93497 44.2188 4.52809C44.2084 3.91127 44.4293 3.31288 44.838 2.85075C45.2466 2.38861 45.8135 2.09622 46.427 2.03112V0.80127H48.2065V2.04976C48.9939 2.18158 49.7151 2.57165 50.2563 3.15849L49.101 4.47219C48.7821 4.09897 48.3755 3.81083 47.9177 3.63366V5.83248C49.6507 6.51263 50.3774 7.23936 50.3774 8.6276C50.4034 9.25024 50.1948 9.85996 49.7928 10.3361C49.3908 10.8123 48.8247 11.1203 48.2065 11.1991L48.1972 12.5035ZM46.6879 3.59639C46.5031 3.63609 46.3386 3.74056 46.2242 3.89092C46.1097 4.04128 46.0527 4.22762 46.0636 4.41629C46.053 4.61946 46.1092 4.82052 46.2236 4.98876C46.338 5.157 46.5043 5.28317 46.6972 5.348L46.6879 3.59639ZM47.9177 9.7177C48.1036 9.64647 48.2618 9.51758 48.3691 9.34991C48.4764 9.18225 48.5272 8.98462 48.514 8.78599C48.5272 8.58736 48.4764 8.38974 48.3691 8.22207C48.2618 8.0544 48.1036 7.92551 47.9177 7.85428V9.7177Z" />
    <path d="M59.7226 10.8174V11.4323H57.8591V2.58109L59.7226 1.77051V5.12465C59.9641 4.87428 60.2535 4.67512 60.5737 4.53905C60.8938 4.40299 61.2381 4.33281 61.586 4.3327C62.9276 4.3327 63.9991 5.4228 63.9991 7.90113C63.9991 10.3795 62.9369 11.5721 61.4835 11.5721C61.1537 11.5748 60.827 11.5092 60.5239 11.3793C60.2208 11.2494 59.948 11.0581 59.7226 10.8174ZM62.0611 7.95704C62.0611 6.43836 61.6698 5.9166 60.9338 5.9166C60.7037 5.92314 60.4774 5.97698 60.269 6.07476C60.0606 6.17253 59.8746 6.31216 59.7226 6.48494V9.39186C59.8728 9.576 60.0616 9.72487 60.2758 9.82791C60.4899 9.93095 60.7241 9.98566 60.9617 9.98816C61.6884 9.98816 62.0611 9.42913 62.0611 7.95704Z" />
    <path d="M65.8716 8.76733V4.47217H67.735V8.51577C67.735 9.60587 68.0984 9.98787 68.7971 9.98787C69.4959 9.98787 69.9245 9.6245 69.9245 8.56236V4.47217H71.7879V11.432H69.9245V10.8171C69.6974 11.0632 69.4203 11.2578 69.1117 11.388C68.8032 11.5182 68.4704 11.5808 68.1356 11.5718C66.6822 11.5718 65.8716 10.6307 65.8716 8.76733Z" />
    <path d="M73.6049 2.5342C73.6308 2.2445 73.7643 1.97501 73.979 1.77874C74.1936 1.58247 74.474 1.47363 74.7648 1.47363C75.0557 1.47363 75.336 1.58247 75.5507 1.77874C75.7654 1.97501 75.8988 2.2445 75.9248 2.5342C75.8988 2.8239 75.7654 3.09339 75.5507 3.28966C75.336 3.48593 75.0557 3.59477 74.7648 3.59477C74.474 3.59477 74.1936 3.48593 73.979 3.28966C73.7643 3.09339 73.6308 2.8239 73.6049 2.5342ZM73.8098 9.42883V4.47215H75.6732V9.13068C75.6543 9.24794 75.6634 9.368 75.6996 9.48111C75.7358 9.59422 75.7982 9.69717 75.8818 9.78161C75.9653 9.86605 76.0676 9.92957 76.1803 9.96703C76.293 10.0045 76.413 10.0148 76.5304 9.99717C76.9636 9.99304 77.3915 9.90112 77.7882 9.72697L77.5087 11.2829C76.9916 11.5093 76.4334 11.6266 75.8689 11.6277C75.576 11.667 75.278 11.636 74.9994 11.5374C74.7208 11.4388 74.4696 11.2754 74.2667 11.0606C74.0637 10.8458 73.9147 10.5858 73.8321 10.3021C73.7494 10.0184 73.7354 9.71903 73.7912 9.42883H73.8098Z" />
    <path d="M79.2509 9.42913V2.58109L81.1143 1.77051V9.09372C81.1143 9.75523 81.459 9.96021 81.9621 9.96021C82.4011 9.95408 82.8347 9.8623 83.2386 9.69001L82.9591 11.246C82.4351 11.4715 81.871 11.5888 81.3006 11.5907C81.0136 11.6236 80.7228 11.5893 80.4513 11.4906C80.1798 11.3918 79.9349 11.2313 79.7361 11.0216C79.5373 10.812 79.39 10.559 79.3058 10.2826C79.2216 10.0062 79.2028 9.71402 79.2509 9.42913Z" />
    <path d="M84.7853 7.98499C84.7853 5.50665 85.8381 4.31407 87.3288 4.31407C87.6501 4.31386 87.9682 4.37807 88.2642 4.50289C88.5603 4.62771 88.8283 4.81062 89.0525 5.0408V2.58109L90.9159 1.77051V11.4323H89.0525V10.7894C88.8179 11.0355 88.5361 11.2316 88.2239 11.3661C87.9117 11.5006 87.5756 11.5706 87.2357 11.5721C85.8661 11.5721 84.7853 10.5379 84.7853 7.98499ZM89.0432 9.42913V6.53153C88.8934 6.34761 88.7044 6.19946 88.49 6.09791C88.2756 5.99636 88.0412 5.94397 87.804 5.94455C87.0773 5.94455 86.6953 6.48494 86.6953 7.97567C86.6953 9.4664 87.1052 10.0161 87.832 10.0161C88.058 10.0067 88.2794 9.94948 88.4818 9.84832C88.6841 9.74715 88.8627 9.60429 89.0059 9.42913H89.0432Z" />
  </g>

  ${icon}
  <g
    text-anchor="middle"
    font-family="Dejavu Sans, sans-serif"
    text-rendering="geometricPrecision"
    style="font-size: 13px;font-weight: 400;"
  >
    <text
      y="15"
      x="50%"
      fill="${header.color}"
      style="font-size: 12px;font-weight: 600;"
      alignment-baseline="middle"
      transform="translate(13,0)"
      font-family="Dejavu Sans, sans-serif"
    ><![CDATA[${title}]]></text>
    <text
      y="27"
      fill="${textColor}"
      style="font-size: 10px;"
    >
      ${description.map((descriptionItem) => `<tspan x="50%" dy="1.7em"><![CDATA[${descriptionItem}]]></tspan>`).join('')}
    </text>
  </g>
</svg>
`
}

module.exports = badgeTemplate
