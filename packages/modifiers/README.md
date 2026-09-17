# @wieslawsoltes/counterform-modifiers

Pure ordered affine/round/reverse/repeat evaluation with coordinate and node budgets. Source controls, anchors and advances are not changed. See exported Modifier declarations for all parameter types.

```js
import {evaluateModifiers} from '@wieslawsoltes/counterform-modifiers';
const result=evaluateModifiers(contours,[{type:'scale',x:1.1,y:1},{type:'translate',x:20}]);
```

ES modules with TypeScript declarations. MIT. Inputs remain under the host application’s ownership.
