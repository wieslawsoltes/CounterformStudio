import {encodeUVS,decodeUVS,readCmapUVS,isVariationSelector,type UVSMapping} from '@wieslawsoltes/counterform-binary';
import {createDemoFont,validateVariationSequences,type VariationSequence} from '@wieslawsoltes/counterform-model';
import {readSVGOutlines,parseSVGTransform,svgViewportTransform} from '@wieslawsoltes/counterform-svg';
import {fromSVG,parseSVGPath,arcToCubics,type SVGContour} from '@wieslawsoltes/counterform-geometry';
import {showVariationSequences} from '@wieslawsoltes/counterform-workbench/encoding';
const doc=createDemoFont();
const record:VariationSequence={unicode:65,selector:0xfe0f,glyphId:doc.data.glyphs[1]!.id};
doc.data.variationSequences=[record];validateVariationSequences(doc.data);doc.variation(65,0xfe0f);
const rows:UVSMapping[]=decodeUVS(encodeUVS([{unicode:65,selector:0xfe0f,glyphIndex:null}]));
const contours:SVGContour[]=parseSVGPath('M0 0A1 1 0 0 1 2 0',{maxNodes:64});
const extract=readSVGOutlines('<svg><path d="M0 0H10V10Z"/></svg>');
const x:number=extract.contours[0]!.nodes[0]!.x;
const arcs=arcToCubics({x:0,y:0},10,10,0,0,1,{x:10,y:10});
const control:number|undefined=arcs[0]?.control1?.x;
// @ts-expect-error invalid SVG sweep flag is not accepted by the typed API.
arcToCubics({x:0,y:0},10,10,0,0,2,{x:10,y:10});
void [rows,contours,x,control,readCmapUVS,isVariationSelector,parseSVGTransform,svgViewportTransform,fromSVG,showVariationSequences];
