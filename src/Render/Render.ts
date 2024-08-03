
import type { RenderProps } from '../Types/Types';
import renderLayer from './RenderLayer';

function render(props: RenderProps) {
  const { canvas, width, height, layerOrder } = props;
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < layerOrder.length; i++) {
    const layerId = layerOrder[i];
    const layer = props.layers[layerId];
    const onionSkin = props.onionSkin;
    const { visible } = layer;
    if (!visible) {
      continue;
    }

    renderLayer(ctx, layerId, onionSkin, props);
  }

};

export default render;