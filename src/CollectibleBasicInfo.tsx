import "./App.css";
import { Collectible } from "./Collectible";
import { getNormalizedTierColor } from "./getNormalizedTierColor";
import "./lootExpanse/styles.css";

export default function CollectibleBasicInfo(props: { item: Collectible }) {
  const { item } = props;
  return (
    <div className="collectible-basic-info">
      <img src={item.image} alt={item.name} />
      <p className={`name`} style={{ color: getNormalizedTierColor(item) }}>
        {item.name}
      </p>
    </div>
  );
}
