import { useMemo } from 'react';
import { Line, Text } from '@react-three/drei';

const DIM_COLOR = '#94a3b8';
const TRAIL_COLOR = '#cbd5f5';
const HINGE_COLOR = '#f97316';

export default function SceneAnnotations({ params, exploded, parts = [], baseParts = [] }) {
  const width = params.width / 1000;
  const height = params.height / 1000;
  const depth = params.depth / 1000;

  const baseMap = useMemo(() => {
    const map = new Map();
    baseParts.forEach((part) => {
      map.set(part.key, part);
    });
    return map;
  }, [baseParts]);

  const trails = useMemo(() => {
    if (exploded < 0.02) return [];
    return parts
      .map((part) => {
        const base = baseMap.get(part.key);
        if (!base) return null;
        return {
          key: part.key,
          start: vecToArray(base.position),
          end: vecToArray(part.position),
        };
      })
      .filter(Boolean);
  }, [parts, baseMap, exploded]);

  return (
    <group>
      <DimensionGuides width={width} height={height} depth={depth} />
      <HingeAnnotations params={params} width={width} height={height} depth={depth} />
      {trails.map((trail) => (
        <Line
          key={`trail-${trail.key}`}
          points={[trail.start, trail.end]}
          color={TRAIL_COLOR}
          lineWidth={1}
          dashed
          dashSize={0.05}
          gapSize={0.02}
        />
      ))}
    </group>
  );
}

function DimensionGuides({ width, height, depth }) {
  return (
    <group>
      <AxisDimension
        axis="x"
        length={width}
        position={[0, 0.02, depth / 2 + 0.08]}
        label={`${Math.round(width * 1000)} mm`}
        textOffset={[0, 0.04, 0]}
      />
      <AxisDimension
        axis="y"
        length={height}
        position={[width / 2 + 0.08, height / 2, depth / 2]}
        label={`${Math.round(height * 1000)} mm`}
        textOffset={[0.04, 0, 0]}
      />
      <AxisDimension
        axis="z"
        length={depth}
        position={[-width / 2 - 0.08, 0.02, 0]}
        label={`${Math.round(depth * 1000)} mm`}
        textOffset={[0, 0.04, 0]}
      />
    </group>
  );
}

function AxisDimension({ axis, length, position, label, textOffset }) {
  const half = length / 2;
  const axisDirections = {
    x: { main: [1, 0, 0], tick: [0, 1, 0] },
    y: { main: [0, 1, 0], tick: [1, 0, 0] },
    z: { main: [0, 0, 1], tick: [0, 1, 0] },
  };
  const { main, tick } = axisDirections[axis];
  const start = [
    position[0] - main[0] * half,
    position[1] - main[1] * half,
    position[2] - main[2] * half,
  ];
  const end = [
    position[0] + main[0] * half,
    position[1] + main[1] * half,
    position[2] + main[2] * half,
  ];
  const tickSize = 0.025;
  const ticks = [start, end].map((anchor, idx) => ({
    key: `${axis}-tick-${idx}`,
    points: [
      [
        anchor[0] - tick[0] * tickSize,
        anchor[1] - tick[1] * tickSize,
        anchor[2] - tick[2] * tickSize,
      ],
      [
        anchor[0] + tick[0] * tickSize,
        anchor[1] + tick[1] * tickSize,
        anchor[2] + tick[2] * tickSize,
      ],
    ],
  }));

  const textPos = [
    position[0] + (textOffset?.[0] ?? 0),
    position[1] + (textOffset?.[1] ?? 0),
    position[2] + (textOffset?.[2] ?? 0),
  ];

  return (
    <group>
      <Line points={[start, end]} color={DIM_COLOR} lineWidth={1.25} />
      {ticks.map((tickLine) => (
        <Line key={tickLine.key} points={tickLine.points} color={DIM_COLOR} lineWidth={1.25} />
      ))}
      <Text
        position={textPos}
        fontSize={0.045}
        color={DIM_COLOR}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.005}
        outlineColor="rgba(15,23,42,0.6)"
      >
        {label}
      </Text>
    </group>
  );
}

function HingeAnnotations({ params, width, height, depth }) {
  const hingeData = useMemo(() => {
    const items = [];
    const frontZ = depth / 2 + 0.02;
    const midY = height / 2;
    if (params.doorCount === 1) {
      const isLeft = params.hingeSide === 'LEFT';
      const x = isLeft ? -width / 2 : width / 2;
      items.push({
        key: 'single',
        x,
        label: isLeft ? 'Left hinge' : 'Right hinge',
      });
    } else {
      items.push({ key: 'double-left', x: -width / 2, label: 'Left hinge' });
      items.push({ key: 'double-right', x: width / 2, label: 'Right hinge' });
    }
    return items.map((item) => ({
      ...item,
      line: [
        [item.x, 0.05, frontZ],
        [item.x, height - 0.05, frontZ],
      ],
      labelPos: [item.x, midY, frontZ + 0.03],
    }));
  }, [params, width, height, depth]);

  return (
    <group>
      {hingeData.map((hinge) => (
        <group key={hinge.key}>
          <Line points={hinge.line} color={HINGE_COLOR} lineWidth={1.2} />
          <Text
            position={hinge.labelPos}
            fontSize={0.04}
            color={HINGE_COLOR}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.004}
            outlineColor="rgba(15,23,42,0.7)"
          >
            {hinge.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

function vecToArray(vec) {
  if (!vec) return [0, 0, 0];
  return [vec.x, vec.y, vec.z];
}
