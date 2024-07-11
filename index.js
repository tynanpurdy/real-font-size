const fontInput = document.getElementById("fontInput");
const fontWeightInput = document.getElementById("fontWeightInput");
const typeSizeInput = document.getElementById("typeSizeInput");
const typeUnitsInput = document.getElementById("typeUnitsInput");
const previewText = document.getElementById("previewText");
const diagram = document.getElementById("diagram");
const testStringInput = document.getElementById("testStringInput");

class Font {
  constructor(name = "Arial", weight = 400, size = 12, units = "pt") {
    (this.name = name),
      (this.weight = weight),
      (this.size = size),
      (this.units = units);
  }

  get style() {
    return `${this.weight} ${this.size}${this.units} ${this.name}`;
  }
}

previewText.style.font = new Font().style;

// INITIALIZE
updateFont();

// FUNCTIONS
function unitsCorrectedSize(size, units) {
  if (units === "pt") {
    return size * (72.0 / 96.0);
  }
  return size;
}

function getRealFontHeightPx(textMetrics) {
  return (
    textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
  );
}

function getFontBoundingHeightPx(textMetrics) {
  return textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function updateFont() {
  const newFont = getChosenFont();
  const testString = getTestString();
  console.log("measure updated");
  console.log(newFont);
  console.log(testString);
  drawDiagram(newFont, testString);
  previewText.style.font = newFont.style;
}

function getChosenFont() {
  return new Font(
    fontInput.value,
    fontWeightInput.value,
    typeSizeInput.value,
    typeUnitsInput.value
  );
}

function getTestString() {
  const testString = testStringInput.value;
  return testString != "" ? testString : "Apd";
}

function drawDiagram(font = new Font(), testString = "Apd", canvas = diagram) {
  const ctx = clearCanvas(canvas);

  // measure the chosen font
  ctx.font = font.style;
  const sampleText = testString;
  const textMetrics = ctx.measureText(sampleText);

  // display the real height
  const realHeightPx = getRealFontHeightPx(textMetrics);
  document.getElementById("realHeight").textContent = `${unitsCorrectedSize(
    realHeightPx,
    font.units
  )} ${font.units}`;
  console.log(textMetrics);

  // create a fixed-size matching diagram font
  const diagramFont = new Font(font.name, font.weight, 18, "rem");
  ctx.font = diagramFont.style;
  const diagramTextMetrics = ctx.measureText(sampleText);

  // resize canvas to fit diagram text
  const sampleTextX = 0;
  const sampleTextY = diagramTextMetrics.fontBoundingBoxAscent;
  canvas.width = diagramTextMetrics.width;
  canvas.height = getFontBoundingHeightPx(diagramTextMetrics);

  // draw bounding-box background
  ctx.beginPath();
  ctx.fillStyle = "#282828";
  ctx.fillRect(
    sampleTextX,
    0,
    diagramTextMetrics.width,
    diagramTextMetrics.fontBoundingBoxAscent +
      diagramTextMetrics.fontBoundingBoxDescent
  );
  ctx.stroke();

  // draw diagram text
  ctx.font = diagramFont.style;
  ctx.fillStyle = "white";
  ctx.fillText(sampleText, sampleTextX, sampleTextY);

  const baselinesAboveAlphabetic = ["actualBoundingBoxAscent"];
  const baselinesBelowAlphabetic = ["actualBoundingBoxDescent"];
  const baselines = [...baselinesAboveAlphabetic, ...baselinesBelowAlphabetic];
  ctx.strokeStyle = "red";

  baselines.forEach((baseline) => {
    const y = sampleTextY;
    ctx.beginPath();

    const baselineMetricValue = diagramTextMetrics[baseline];
    if (baselineMetricValue === undefined) {
      return;
    }

    const lineY = baselinesBelowAlphabetic.includes(baseline)
      ? y + Math.abs(baselineMetricValue)
      : y - Math.abs(baselineMetricValue);
    ctx.moveTo(sampleTextX, lineY);
    ctx.lineTo(sampleTextX + diagramTextMetrics.width, lineY);
    ctx.stroke();
  });
}

// EVENT HANDLERS
typeInputs.addEventListener("change", updateFont);

testStringInput.addEventListener("input", updateFont);

document
  .getElementById("copyButton")
  .addEventListener("click", async function () {
    try {
      const realHeight = document.getElementById("realHeight").textContent;

      // Use the Clipboard API to copy the text
      await navigator.clipboard.writeText(realHeight);

      // signify value has been copied via button content
      let originalText = this.textContent;
      this.textContent = "✅";
      setTimeout(
        function () {
          this.textContent = originalText;
        }.bind(this),
        1500
      );
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  });

document.getElementById("launchFonts").addEventListener("click", () => {
  if (navigator.userAgent.toUpperCase().indexOf("MAC") >= 0) {
    window.open("fontbook://");
  } else if (navigator.userAgent.toUpperCase().indexOf("WIN") >= 0) {
    window.open("ms-settings:fonts");
  } else if (navigator.userAgent.includes("Linux")) {
    alert(
      "I'm a novice programmer, ok? You chose linux and you knew the consequences when you did so. I have no clue how to open your font manager, if you even bothered to install one. Your fonts are in a folder somewhere, or three, I have no idea. Have fun searching, I believe in you."
    );
  } else if (navigator.userAgent.includes("Android")) {
    alert(
      "Font management is not available on Android. I don't make the rules. You can yell at Sundar Pichai if you want."
    );
  } else if (
    navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("iPad")
  ) {
    alert(
      "Font management is not available on iOS. I don't make the rules. You can yell at Tim Apple if you want."
    );
  } else {
    alert(
      "Whatever OS you're running is not easily identified by my simple if statements. Good on you. As for your fonts, I have no clue where they are."
    );
  }
});
