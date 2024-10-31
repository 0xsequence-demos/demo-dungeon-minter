import { Collectible } from "./Collectible";
import capitalizeFirstLetter from "./capitalizeFirstLetter";

export default function AttributeList(props: { item: Collectible }) {
  const { item } = props;
  return (
    <ul className="attributes">
      {item.attributes
        .filter((a) => !!a.value)
        .map((attr) => {
          if (attr.display_type != "tier" && attr.display_type != "type")
            if (attr.display_type == "category") {
              return (
                <li key={attr.display_type} className={attr.display_type}>
                  {capitalizeFirstLetter(attr.value)}
                </li>
              );
            } else {
              return (
                <li key={attr.display_type}>
                  {attr.trait_type + ": " + attr.value}
                </li>
              );
            }
        })}
    </ul>
  );
}
