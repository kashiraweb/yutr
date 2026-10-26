/* Modelo visual único de Noemix (SVG), tal como se diseñó. Lo comparten todas las pantallas.
   noemix.js lo inserta en cualquier contenedor con data-noemix. */
window.NOEMIX_SVG=`<svg id="noemix" viewBox="0 0 600 600" role="img" aria-label="Noemix, el asistente de CODEXA">
<defs>
  <radialGradient id="gBody" cx="38%" cy="26%" r="85%">
    <stop offset="0" stop-color="#F6FBFF"/><stop offset=".38" stop-color="#C4E4FF"/>
    <stop offset=".78" stop-color="#6CB0FF"/><stop offset="1" stop-color="#3E7BF2"/>
  </radialGradient>
  <radialGradient id="gRim" cx="50%" cy="100%" r="60%">
    <stop offset="0" stop-color="#8B5CF6" stop-opacity=".35"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="gScreen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#14306b"/><stop offset=".35" stop-color="#0a1a44"/><stop offset="1" stop-color="#080816"/>
  </linearGradient>
  <linearGradient id="gEar" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#42D9FF"/><stop offset=".5" stop-color="#245BFF"/><stop offset="1" stop-color="#1b3fbf"/>
  </linearGradient>
  <linearGradient id="gCap" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5aa9ff"/><stop offset="1" stop-color="#245BFF"/>
  </linearGradient>
  <radialGradient id="gHalo" cx="50%" cy="50%" r="50%">
    <stop offset=".7" stop-color="#42D9FF" stop-opacity=".0"/><stop offset=".92" stop-color="#42D9FF" stop-opacity=".22"/><stop offset="1" stop-color="#8B5CF6" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
    <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="cScreen"><ellipse cx="300" cy="318" rx="168" ry="122"/></clipPath>
</defs>

<g id="root">
  <circle id="halo" cx="300" cy="305" r="285" fill="url(#gHalo)"/>

  <!-- orejas / auriculares -->
  <g id="earL"><ellipse cx="72" cy="318" rx="42" ry="88" fill="url(#gEar)"/><ellipse cx="68" cy="318" rx="24" ry="62" fill="none" stroke="#bff3ff" stroke-width="9" filter="url(#glow)"/><ellipse cx="66" cy="318" rx="12" ry="40" fill="#2f78ff" opacity=".7"/></g>
  <g id="earR"><ellipse cx="528" cy="318" rx="42" ry="88" fill="url(#gEar)"/><ellipse cx="532" cy="318" rx="24" ry="62" fill="none" stroke="#bff3ff" stroke-width="9" filter="url(#glow)"/><ellipse cx="534" cy="318" rx="12" ry="40" fill="#2f78ff" opacity=".7"/></g>

  <!-- cuerpo esférico -->
  <g id="body">
    <circle cx="300" cy="305" r="232" fill="url(#gBody)"/>
    <circle cx="300" cy="305" r="232" fill="url(#gRim)"/>
    <path d="M150 170 Q215 95 300 88" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="14" stroke-linecap="round"/>
    <path id="gloss" d="M470 190 Q505 230 512 285" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="10" stroke-linecap="round"/>
    <!-- tapa superior con N -->
    <g id="cap">
      <path d="M205 118 Q300 70 395 118 Q380 142 300 142 Q220 142 205 118Z" fill="url(#gCap)"/>
      <path d="M218 124 Q300 150 382 124" fill="none" stroke="#42D9FF" stroke-width="5" stroke-linecap="round" filter="url(#glow)"/>
      <path d="M283 124 V100 L309 124 V100" fill="none" stroke="#dff8ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
    </g>
  </g>

  <!-- rostro -->
  <g id="face">
    <ellipse cx="300" cy="318" rx="176" ry="130" fill="#42D9FF" opacity=".55" filter="url(#glow)"/>
    <ellipse cx="300" cy="318" rx="170" ry="124" fill="#245BFF"/>
    <ellipse cx="300" cy="318" rx="165" ry="119" fill="url(#gScreen)"/>
    <g clip-path="url(#cScreen)"><path d="M380 205 Q440 225 462 275 Q400 250 340 235Z" fill="#fff" opacity=".13"/></g>
    <g id="features">
      <g id="eyeL" transform="translate(222 322)"><path class="eye" d="M-46 14 A46 46 0 0 1 46 14" fill="none" stroke="#e6fbff" stroke-width="20" stroke-linecap="round" filter="url(#glow)"/></g>
      <g id="eyeR" transform="translate(378 322)"><path class="eye" d="M-46 14 A46 46 0 0 1 46 14" fill="none" stroke="#e6fbff" stroke-width="20" stroke-linecap="round" filter="url(#glow)"/></g>
      <g id="mouth" transform="translate(300 385)"><path id="mouthOpen" d="M-27 2 Q0 5 27 2 Q23 36 0 38 Q-23 36 -27 2Z" fill="#9fefff" opacity="0" filter="url(#glow)"/><path d="M-30 0 Q0 34 30 0" fill="none" stroke="#e6fbff" stroke-width="11" stroke-linecap="round" filter="url(#glow)"/></g>
      <g id="blush" stroke="#7fe6ff" stroke-width="5" stroke-linecap="round" opacity=".8" filter="url(#glow)">
        <path d="M168 395 l-6 12 M183 392 l-6 12"/><path d="M417 392 l6 12 M432 395 l6 12"/>
      </g>
    </g>
  </g>
</g>
</svg>`;
