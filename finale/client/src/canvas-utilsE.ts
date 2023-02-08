import { NodeDisplayData, PartialButFor, PlainObject } from "sigma/types";
import { Settings } from "sigma/settings";
import Graph from "graphology";

const TEXT_COLOR = "#000000";

/**
 * This function draw in the input canvas 2D context a rectangle.
 * It only deals with tracing the path, and does not fill or stroke.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Custom hover renderer
 */

 export function drawClick(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;
  const label = data.label;
  const subLabel = data.sequence.length >= 25 ? data.sequence.substring(0,25) + '...' : data.sequence;
  const refLabel = data.tag || '';
  
  let end = ', '
  let sampleLabel = ''
  if (data.sample.length) {
    
    sampleLabel = 'EPI ID: ';
    data.sample.forEach((el: any) => {
      if (el !== 'reference' && !sampleLabel.includes(el.substring(8))){
        sampleLabel+= el.substring(8) + end
      }
    })
    
  sampleLabel =  (sampleLabel.length >= 25) ? sampleLabel.substring(0,22) + '...' : sampleLabel.substring(0,-2)
  }
  
  
//   const sampleLabel = data.sample.length>1 ? 'EPI ID: ' + data.sample?.filter(function(item: string, pos: number) {
//     if (data.sample.indexOf(item) == pos && item!=='reference'){
//       console.log(item)
//       return item.substring(8,-1)
//     }
//     return (data.sample.indexOf(item) == pos && item!=='reference').toString().substring(1,20);
// }).toString().substring(0,25) + '...' : '';
//   const sampleLabel = data.sample ? data.sample?.filter(function(item: string, pos: number) {
//     return data.sample.indexOf(item) == pos;
// }) + '...' : '';
  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";
  
  context.font = `${weight} ${size}px ${font}`;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const subLabelWidth = context.measureText(subLabel).width;
  const labelWidth = context.measureText(label).width;
  const samplelabelWidth = context.measureText(sampleLabel).width;
  const refLabelWidth = context.measureText(refLabel).width;
  let textWidth = Math.max(subLabelWidth, labelWidth, refLabelWidth, samplelabelWidth);
  
  //Add interline spaces
  const interline = subLabelSize/6;
  const margin = 20;
  const fieldInterline = subLabelSize/3;

  const x = 10
  const y = 200
  const w = Math.round(textWidth + 1.5*size);
  const hLabel = Math.round(size*1.4);
  const hSubLabel = (subLabelSize + interline)*2
  const hRefLabel = refLabel!=='' ? subLabelSize + interline : 0;
  const hSampleLabel = sampleLabel!=='' ? subLabelSize + interline : 0;
  // let hSubLabel = fieldInterline + (subLabelSize + interline)*(Math.floor(context.measureText(subLabel).width/MAX_WIDTH)+1);
  // const h = hLabel + hSubLabel + hRefLabel + hSampleLabel + margin/2 
  const h = hLabel + hSubLabel + hRefLabel + hSampleLabel + margin/2 
  drawRoundRect(context, x, y - margin, w, h, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels

  context.fillStyle = data.color;
  context.font = `${weight} ${size +2}px ${font}`;
  context.fillText(label, x + 10, data.y);

 }
export function drawHover(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;

  const label = data.label;
  const subLabel = data.sequence.length >= 25 ? data.sequence.substring(0,25) + '...' : data.sequence;
  const refLabel = data.tag || '';
  
  let end = ', '
  let sampleLabel = ''
  if (data.sample) {
    
    sampleLabel = 'EPI ID: ';
    data.sample.forEach((el: any) => {
      if (el !== 'reference' && !sampleLabel.includes(el.substring(8))){
        sampleLabel+= el.substring(8) + end
      }
    })
    
  sampleLabel =  (sampleLabel.length >= 25) ? sampleLabel.substring(0,22) + '...' : sampleLabel.substring(0,-2)
  }
  
  
//   const sampleLabel = data.sample.length>1 ? 'EPI ID: ' + data.sample?.filter(function(item: string, pos: number) {
//     if (data.sample.indexOf(item) == pos && item!=='reference'){
//       console.log(item)
//       return item.substring(8,-1)
//     }
//     return (data.sample.indexOf(item) == pos && item!=='reference').toString().substring(1,20);
// }).toString().substring(0,25) + '...' : '';
//   const sampleLabel = data.sample ? data.sample?.filter(function(item: string, pos: number) {
//     return data.sample.indexOf(item) == pos;
// }) + '...' : '';
  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";
  
  context.font = `${weight} ${size}px ${font}`;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const subLabelWidth = context.measureText(subLabel).width;
  const labelWidth = context.measureText(label).width;
  const samplelabelWidth = context.measureText(sampleLabel).width;
  const refLabelWidth = context.measureText(refLabel).width;
  let textWidth = Math.max(subLabelWidth, labelWidth, refLabelWidth, samplelabelWidth);
  
  //Add interline spaces
  const interline = subLabelSize/6;
  const margin = 20;
  const fieldInterline = subLabelSize/3;

  const x = Math.round(data.x + data.size -5);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + 1.5*size);
  const hLabel = Math.round(size*1.4);
  const hSubLabel = (subLabelSize + interline)*2
  const hRefLabel = refLabel!=='' ? subLabelSize + interline : 0;
  const hSampleLabel = sampleLabel!=='' ? subLabelSize + interline : 0;
  const hKCLabel = data.KC ? subLabelSize + interline : 0;
  // let hSubLabel = fieldInterline + (subLabelSize + interline)*(Math.floor(context.measureText(subLabel).width/MAX_WIDTH)+1);
  // const h = hLabel + hSubLabel + hRefLabel + hSampleLabel + margin/2 
  const h =  hLabel + hSubLabel + hRefLabel + hSampleLabel +hKCLabel+ margin/2 
  drawRoundRect(context, x, y - margin, w, h, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // And finally we draw the labels

  context.fillStyle = data.color;
  context.font = `${weight} ${size +2}px ${font}`;
  context.fillText(label, x + 10, data.y);

  if (subLabel) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(subLabel, x + 10, data.y   + fieldInterline + (subLabelSize + interline));
    context.fillStyle = '#696969';
    context.font = `italic ${subLabelSize}px ${font}`;
    if (data.KC) {
      const KCRatio = Math.round(data.KC.split(':')[2]/data.sequence.length*100)/100
      context.fillText('KC content: '+KCRatio, x + 10, data.y   + fieldInterline + (subLabelSize + interline) * 3);

    }
    context.fillText('Length: '+data.sequence.length, x + 10, data.y   + fieldInterline + (subLabelSize + interline) * 2);

  }

  context.fillStyle = data.color;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  if (refLabel !== ''){
    context.fillText(refLabel, x + 10, data.y   + fieldInterline + (subLabelSize + interline) * 3);
  }
  context.fillStyle = '#696969';
  context.fillText(sampleLabel, x + 10, data.y   + fieldInterline + (subLabelSize + interline) * 4);
}

/**
 * Custom label renderer
 */
export default function drawLabel(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
  settings: Settings,
): void {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = data.color;
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}

export function searchSample(data: Graph, samp: string){
  data.forEachNode((node) =>{
    let sample = data.getNodeAttribute(node, 'id');
    const hid = !data.getNodeAttribute(node, 'hidden');
    if(samp.includes(sample) ){
      data.setNodeAttribute(node, 'hidden', hid);
    }
  });
}