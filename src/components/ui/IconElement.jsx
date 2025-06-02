import { Icon } from '@iconify/react';
import { Html } from 'react-konva-utils';
import { KonvaEventObject } from 'konva/lib/Node';
import { updateElement } from '../store/canvasSlice';
import { toPercent } from '../utils/helpers';

const IconElement = ({ 
  element, 
  dispatch, 
  onSelect, 
  isSelected,
  stageWidth,
  stageHeight 
}) => {
  return (
    <Html
      groupProps={{
        x: element.x,
        y: element.y,
        draggable: true,
        onClick: (e) => {
          e.cancelBubble = true; // Prevent event bubbling
          onSelect(e);
        },
        onTap: (e) => {
          e.cancelBubble = true; // Prevent event bubbling
          onSelect(e);
        },
        onDragStart: (e) => {
          e.cancelBubble = true; // Prevent event bubbling
          onSelect(e);
        },
        onDragMove: (e: KonvaEventObject<MouseEvent>) => {
          const node = e.target;
          const newX = node.x();
          const newY = node.y();
          
          dispatch(
            updateElement({
              id: element.id,
              updates: {
                x: newX,
                y: newY,
                width_percent: toPercent(element.width, stageWidth),
                height_percent: toPercent(element.height, stageHeight),
                x_percent: toPercent(newX, stageWidth),
                y_percent: toPercent(newY, stageHeight),
              },
            })
          );
        },
      }}
      divProps={{
        style: {
          pointerEvents: 'none', // This is important to allow events to pass through to Konva
        }
      }}
    >
      <div
        style={{
          width: element.width,
          height: element.height,
          padding: '5px',
          border: isSelected ? '2px solid #1E88E5' : '2px solid transparent',
          borderRadius: '4px',
          backgroundColor: isSelected ? 'rgba(30, 136, 229, 0.1)' : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none', // Important to allow events to pass through
        }}
      >
        <Icon 
          icon={element.iconName} 
          width={element.width * 0.8} 
          height={element.height * 0.8} 
          color={element.color || "#000000"} 
        />
      </div>
    </Html>
  );
};

export default IconElement;