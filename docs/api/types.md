# Types

## Scroll

For scroll events the `scroll` object is exposed which contains the following properties.

| Property | Type | Description |
|:---|:---|:---|
| x | number | Horizontal scroll position |
| y | number | Vertical scroll position |
| xTurn | number | Horizontal scroll position where the scroll dRection turned in the opposite dRection |
| yTurn | number | Vertical scroll position where the scroll dRection turned in the opposite dRection |
| xDTurn | number | Difference of the horizontal scroll position where the scroll dRection turned in the opposite dRection |
| yDTurn | number | Difference of the vertical scroll position where the scroll dRection turned in the opposite dRection |
| isScrollingUp | boolean | Whether the page is scrolling up |
| isScrollingDown | boolean | Whether the page is scrolling down |
| isScrollingLeft | boolean | Whether the page is scrolling left |
| isScrollingRight | boolean | Whether the page is scrolling right |

## Dimensions

| Property | Type | Description |
|:---|:---|:---|
| width | number | Inner width of the `window` |
| height | number | Inner height of the `window` |
| outerWidth | Outer width of the `window` |
| outerHeight | Outer height of the `window` |
| clientWidth | number | Width of the document element |
| clientHeight | number | Height of the document element |
| documentWidth | number | Complete width of the document |
| documentHeight | number | Complete height of the document |

## Viewport

| Property | Type | Description |
|:---|:---|:---|
| scroll | Scroll | See Scroll type above |
| dimensions | Dimensions | See Dimensions type above |


## Rect

| Property | Type | Description |
|:---|:---|:---|
| top | number | Top position of the element, relative to the viewport |
| right | number | Right position of the element, relative to the viewport |
| bottom | number | Bottom position of the element, relative to the viewport |
| left | number | Left position of the element, relative to the viewport |
| width | number | Width of the element |
| height | number | Height of the element |
