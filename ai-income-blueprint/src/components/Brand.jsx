import { SparkleIcon } from './Icons';

export default function Brand() {
  return (
    <span className="brand">
      <span className="brand__mark"><SparkleIcon width={22} height={22} /></span>
      <span className="brand__text">
        <strong>AI Income</strong>
        <small>Blueprint</small>
      </span>
    </span>
  );
}
