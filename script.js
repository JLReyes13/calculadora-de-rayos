const tipoCtrl = document.getElementById('tipoCtrl');

const sections = [
  'front_rim',
  'front_disc',
  'rear_rim',
  'rear_disc'
];

const sideLabels = {
  front_rim: {
    cross1: 'Cruces lado izquierdo',
    cross2: 'Cruces lado derecho',
    result1: 'Izquierdo',
    result2: 'Derecho'
  },
  front_disc: {
    cross1: 'Cruces lado disco',
    cross2: 'Cruces lado no disco',
    result1: 'Disco',
    result2: 'No disco'
  },
  rear_rim: {
    cross1: 'Cruces lado transmisión',
    cross2: 'Cruces lado no transmisión',
    result1: 'Transmisión',
    result2: 'No transmisión'
  },
  rear_disc: {
    cross1: 'Cruces lado transmisión',
    cross2: 'Cruces lado disco',
    result1: 'Transmisión',
    result2: 'Disco'
  }
};

const helpContent = {
  erd: {
    title: 'Diámetro interno del rin o ERD',
    copy: 'Si mides el diámetro interno visible del rin, ingrésalo aquí y completa la profundidad hasta el asiento del niple. Si ya conoces el ERD del fabricante, ingrésalo aquí y deja la profundidad en 0.',
    visual: `
      <img src="images/ERD.png" alt="Ejemplo para medir Diametro Interno del Rin">
    `
  },
  'rim-depth': {
    title: 'Profundidad hasta el asiento del niple',
    copy: 'Mide radialmente desde la superficie interior del rin hasta el punto donde se apoya la cabeza del niple. Esta medida se suma en ambos lados al diámetro interno. Si ingresaste el ERD real, escribe 0.',
    visual: `
      <img src="images/grosorRim.png" alt="Ejemplo de profundidad hasta el asiento del niple">
    `
  },
  old: {
    title: 'OLD',
    copy: 'Mide el ancho total de la maza entre las caras exteriores de las contratuercas que apoyan en el cuadro o la horquilla.',
    visual: `
      <img src="images/old_maza.png" alt="Ejemplo de OLD de la maza">
    `
  },
  flange: {
    title: 'Diámetro del ala',
    copy: 'Mide el diámetro del círculo de agujeros del ala de la maza, de centro de agujero a centro de agujero opuesto.',
    visual: `
      <img src="images/diametroAla.png" alt="Ejemplo de diámetro del ala de la maza">
    `
  },
  locknut: {
    title: 'Contratuerca a ala',
    copy: 'Mide la distancia desde el ala de la maza hasta la cara exterior de la contratuerca correspondiente en cada lado.',
    visual: `
      <img src="images/contratuerca-Ala.png" alt="Ejemplo de contratuerca a ala">
    `
  },
  crosses: {
    title: 'Cruces por lado',
    copy: 'Selecciona cuántas veces cruza cada rayo en ese lado de la rueda. En ruedas con disco o traseras, un lado puede usar un patrón distinto al otro.',
    visual: `
      <img src="images/cruces.png" alt="Ejemplo de cruces de rayos">
    `
  }
};

let tipoActual = 'front_rim';

function g(id){

  return document.getElementById(id);

}

function v(id){

  return parseFloat(g(id).value);

}

function isPositive(value){

  return Number.isFinite(value) && value > 0;

}

function updateSideLabels(){

  const labels = sideLabels[tipoActual];

  g('crossLabel1').textContent = labels.cross1;

  g('crossLabel2').textContent = labels.cross2;

  g('sideSpokesLabel1').textContent =
    'Rayos lado ' + labels.result1.toLowerCase();

  g('sideSpokesLabel2').textContent =
    'Rayos lado ' + labels.result2.toLowerCase();

}

function isRearWheel(){

  return tipoActual === 'rear_rim' || tipoActual === 'rear_disc';

}

function defaultSideSpokes(){

  return parseInt(g('agujeros').value) / 2;

}

function updateSideSpokeControls(){

  const customEnabled = g('customSideSpokes').checked;

  g('sideSpokesPanel').classList.toggle(
    'hidden',
    !isRearWheel()
  );

  g('side_spokes_1').disabled = !customEnabled;

  g('side_spokes_2').disabled = !customEnabled;

  if(!customEnabled){

    const defaultValue = defaultSideSpokes();

    g('side_spokes_1').value = defaultValue;

    g('side_spokes_2').value = defaultValue;

  }

}

tipoCtrl.querySelectorAll('.seg-btn').forEach(btn => {

  btn.addEventListener('click', () => {

    tipoCtrl.querySelectorAll('.seg-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    tipoActual = btn.dataset.val;

    sections.forEach(s => {

      g('sec_' + s).classList.toggle(
        'visible',
        s === tipoActual
      );

    });

    g('results').classList.remove('visible');

    updateSideLabels();

    updateSideSpokeControls();

    hideWarn();

  });

});

function calcRayo(
  erd,
  flangeDiameter,
  centerToFlange,
  spokesOnSide,
  crosses
){

  const rimRadius = erd / 2;

  const flangeRadius = flangeDiameter / 2;

  const spokeAngle =
    (360 * crosses / spokesOnSide)
    * Math.PI / 180;

  return Math.sqrt(
    rimRadius * rimRadius +
    flangeRadius * flangeRadius +
    centerToFlange * centerToFlange -
    2 * rimRadius * flangeRadius * Math.cos(spokeAngle)
  );

}

function showWarn(msg){

  const w = g('warn');

  w.classList.add('visible');

  g('warnMsg').textContent = msg;

}

function hideWarn(){

  g('warn').classList.remove('visible');

}

function resetOutput(){

  hideWarn();

  g('results').classList.remove('visible');

}

function warnCrosses(holes, crosses, sideLabel){

  if(holes === 20 && crosses === 4){

    showWarn(
      sideLabel + ': 20H no recomendado para 4×.'
    );

  }

  if(holes === 24 && crosses === 4){

    showWarn(
      sideLabel + ': 24H rara vez usa 4×.'
    );

  }

}

function validateCrosses(spokesOnSide, crosses, sideLabel){

  if(crosses >= spokesOnSide / 2){

    showWarn(
      sideLabel + ': reduce cruces o aumenta rayos de ese lado.'
    );

    return false;

  }

  return true;

}

function sideSpokeCounts(holes){

  if(!isRearWheel() || !g('customSideSpokes').checked){

    const defaultCount = holes / 2;

    return {
      side1: defaultCount,
      side2: defaultCount
    };

  }

  const side1 = Number(g('side_spokes_1').value);

  const side2 = Number(g('side_spokes_2').value);

  if(
    !Number.isInteger(side1) ||
    !Number.isInteger(side2) ||
    side1 <= 0 ||
    side2 <= 0
  ){

    showWarn(
      'Ingresa rayos válidos para cada lado.'
    );

    return null;

  }

  if(side1 + side2 !== holes){

    showWarn(
      'Los rayos por lado deben sumar ' + holes + '.'
    );

    return null;

  }

  return {
    side1,
    side2
  };

}

function centerToFlangeFromLocknut(old, locknutToFlange){

  return (old / 2) - locknutToFlange;

}

function validateSide(
  flange,
  locknutToFlange,
  old,
  sideLabel
){

  if(!isPositive(flange) || !isPositive(locknutToFlange)){

    showWarn(
      'Completa diámetro de ala y contratuerca a ala para ' + sideLabel + '.'
    );

    return false;

  }

  if(locknutToFlange >= old / 2){

    showWarn(
      sideLabel + ': contratuerca a ala debe ser menor que OLD/2.'
    );

    return false;

  }

  return true;

}

function sideResult(
  erd,
  flange,
  locknutToFlange,
  old,
  spokesOnSide,
  crosses
){

  return calcRayo(
    erd,
    flange,
    centerToFlangeFromLocknut(old, locknutToFlange),
    spokesOnSide,
    crosses
  );

}

function openHelp(helpKey){

  const content = helpContent[helpKey];

  if(!content){

    return;

  }

  g('helpTitle').textContent = content.title;

  g('helpVisual').innerHTML = content.visual;

  g('helpCopy').textContent = content.copy;

  g('helpModal').classList.add('visible');

  g('helpModal').setAttribute('aria-hidden', 'false');

}

function closeHelp(){

  g('helpModal').classList.remove('visible');

  g('helpModal').setAttribute('aria-hidden', 'true');

}

document.querySelectorAll('.info-btn').forEach(btn => {

  btn.addEventListener('click', () => {

    openHelp(btn.dataset.help);

  });

});

g('helpClose').addEventListener('click', closeHelp);

g('helpCloseBackdrop').addEventListener('click', closeHelp);

g('agujeros').addEventListener('change', () => {

  updateSideSpokeControls();

  resetOutput();

});

g('customSideSpokes').addEventListener('change', () => {

  updateSideSpokeControls();

  resetOutput();

});

document
  .querySelectorAll('input, select')
  .forEach(control => {

    if(
      control.id !== 'agujeros' &&
      control.id !== 'customSideSpokes'
    ){

      control.addEventListener('input', resetOutput);

      control.addEventListener('change', resetOutput);

    }

  });

document.addEventListener('keydown', event => {

  if(event.key === 'Escape'){

    closeHelp();

  }

});

g('calcBtn').addEventListener('click', () => {

  hideWarn();

  const erd = v('erd');

  const old = v('old');

  const holes =
    parseInt(g('agujeros').value);

  const crosses1 =
    parseInt(g('cruces_1').value);

  const crosses2 =
    parseInt(g('cruces_2').value);

  const rimDepthInput = v('rim_depth');

  const rimDepth =
    Number.isFinite(rimDepthInput) ? rimDepthInput : 0;

  if(!isPositive(erd) || !isPositive(old)){

    showWarn(
      'Ingresa ERD y OLD.'
    );

    return;

  }

  if(rimDepth < 0){

    showWarn(
      'La profundidad hasta el asiento del niple no puede ser negativa.'
    );

    return;

  }

  const effectiveErd = erd + (rimDepth * 2);

  if(effectiveErd <= 0){

    showWarn(
      'El ERD efectivo debe ser mayor que cero.'
    );

    return;

  }

  const labels = sideLabels[tipoActual];

  const spokes = sideSpokeCounts(holes);

  if(!spokes){

    return;

  }

  if(
    !validateCrosses(spokes.side1, crosses1, labels.result1) ||
    !validateCrosses(spokes.side2, crosses2, labels.result2)
  ){

    return;

  }

  warnCrosses(holes, crosses1, labels.result1);

  warnCrosses(holes, crosses2, labels.result2);

  let r1, r2;

  if(tipoActual === 'front_rim'){

    const fl = v('fr_flange');

    const locknutToFlange = v('fr_locknut');

    if(!validateSide(fl, locknutToFlange, old, 'ambos lados')){

      return;

    }

    r1 = sideResult(
      effectiveErd,
      fl,
      locknutToFlange,
      old,
      spokes.side1,
      crosses1
    );

    r2 = sideResult(
      effectiveErd,
      fl,
      locknutToFlange,
      old,
      spokes.side2,
      crosses2
    );

  }

  else if(tipoActual === 'front_disc'){

    const flDs = v('fd_ds_flange');
    const ltfDs = v('fd_ds_locknut');

    const flNds = v('fd_nds_flange');
    const ltfNds = v('fd_nds_locknut');

    if(
      !validateSide(flDs, ltfDs, old, 'lado disco') ||
      !validateSide(flNds, ltfNds, old, 'lado no disco')
    ){

      return;

    }

    r1 = sideResult(
      effectiveErd,
      flDs,
      ltfDs,
      old,
      spokes.side1,
      crosses1
    );

    r2 = sideResult(
      effectiveErd,
      flNds,
      ltfNds,
      old,
      spokes.side2,
      crosses2
    );

  }

  else if(tipoActual === 'rear_rim'){

    const flDs = v('rr_ds_flange');
    const ltfDs = v('rr_ds_locknut');

    const flNds = v('rr_nds_flange');
    const ltfNds = v('rr_nds_locknut');

    if(
      !validateSide(flDs, ltfDs, old, 'lado transmisión') ||
      !validateSide(flNds, ltfNds, old, 'lado no transmisión')
    ){

      return;

    }

    r1 = sideResult(
      effectiveErd,
      flDs,
      ltfDs,
      old,
      spokes.side1,
      crosses1
    );

    r2 = sideResult(
      effectiveErd,
      flNds,
      ltfNds,
      old,
      spokes.side2,
      crosses2
    );

  }

  else{

    const flDs = v('rd_ds_flange');
    const ltfDs = v('rd_ds_locknut');

    const flDisc = v('rd_disc_flange');
    const ltfDisc = v('rd_disc_locknut');

    if(
      !validateSide(flDs, ltfDs, old, 'lado transmisión') ||
      !validateSide(flDisc, ltfDisc, old, 'lado disco')
    ){

      return;

    }

    r1 = sideResult(
      effectiveErd,
      flDs,
      ltfDs,
      old,
      spokes.side1,
      crosses1
    );

    r2 = sideResult(
      effectiveErd,
      flDisc,
      ltfDisc,
      old,
      spokes.side2,
      crosses2
    );

  }

  g('lab1').textContent =
    labels.result1 + ' · ' + crosses1 + '×';

  g('lab2').textContent =
    labels.result2 + ' · ' + crosses2 + '×';

  g('res1').textContent =
    r1.toFixed(1);

  g('res2').textContent =
    r2.toFixed(1);

  g('resultDetails').textContent =
    'ERD usado en el cálculo: ' +
    effectiveErd.toFixed(1) +
    ' mm.';

  g('results')
    .classList.add('visible');

  g('results')
    .scrollIntoView({
      behavior: 'smooth'
    });

});

updateSideLabels();

updateSideSpokeControls();
