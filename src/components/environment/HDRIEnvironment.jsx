import { Environment } from '@react-three/drei';

export default function HDRIEnvironment(props) {
  return (
    <Environment
      files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr"
      environmentIntensity={1}
      resolution={256}
      ground={{ height: 0.01, radius: 50, scale: 130 }}
      {...props}
    />
  );
}
