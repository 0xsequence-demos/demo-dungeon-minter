import dataArmor from "./data/diablo/Armor.tsv.txt";
import dataWeapons from "./data/diablo/Weapons.tsv.txt";
import dataMagicSuffix from "./data/diablo/MagicSuffix.tsv.txt";
import dataMagicPrefix from "./data/diablo/MagicPrefix.tsv.txt";
import dataItemTypes from "./data/diablo/ItemTypes.tsv.txt";

const tableDataRaw = {
  Armor: dataArmor,
  Weapons: dataWeapons,
  MagicSuffix: dataMagicSuffix,
  MagicPrefix: dataMagicPrefix,
  ItemTypes: dataItemTypes,
} as const;

type DataCategory = keyof typeof tableDataRaw;

const tablePropNames = new Map<DataCategory, string[]>();
const tableData = new Map<DataCategory, string[][]>();

interface RowsDataSet {
  rows: string[][];
  propNames: string[];
}

interface RowData {
  row: string[];
  propNames: string[];
}

function getPropOfItem(item: RowData, propName: string) {
  return item.row[item.propNames.indexOf(propName)];
}

function getDataRows(cat: DataCategory): RowsDataSet {
  if (!tableData.has(cat)) {
    const rows = tableDataRaw[cat].split("\r\n");
    const tableName = rows.shift()!;
    const rowArrs = rows.map((row) => row.split("\t"));
    const propNames = rowArrs.shift()!;
    console.log(`initializing data for ${tableName}`);
    tableData.set(cat, rowArrs);
    tablePropNames.set(cat, propNames);
  }
  return {
    rows: tableData.get(cat)!,
    propNames: tablePropNames.get(cat)!,
  };
}

function getRandomRow(
  rows: string[][],
  propNames: string[],
  test: (propNames: string[], data: string[], depth: number) => boolean,
  depth = 0,
): RowData {
  const row = rows[~~(Math.random() * rows.length)];
  if (test(row, propNames, depth)) {
    return {
      row,
      propNames: propNames,
    };
  } else {
    return getRandomRow(rows, propNames, test, depth + 1);
  }
}

function unpackTypes(type: string, types: string[]) {
  types.push(type);
  const data = getDataRows("ItemTypes");
  const iCode = data.propNames.indexOf("Code");
  const codeRow = data.rows.find((row) => type === row[iCode]);
  if (codeRow) {
    const iEquiv1 = data.propNames.indexOf("Equiv1");
    const iEquiv2 = data.propNames.indexOf("Equiv2");
    const e1 = codeRow[iEquiv1];
    if (e1) {
      unpackTypes(e1, types);
    }
    const e2 = codeRow[iEquiv2];
    if (e2) {
      unpackTypes(e2, types);
    }
  }
}

function getMagicModifier(
  source: "MagicPrefix" | "MagicSuffix",
  itemTypes: Set<string>,
  lastExcludeColName: string,
) {
  const magicModifiers = getDataRows(source);

  const includedStart = magicModifiers.propNames.indexOf("itype1");
  const includedEnd = magicModifiers.propNames.indexOf("itype7");

  const excludedStart = magicModifiers.propNames.indexOf("etype1");
  const excludedEnd = magicModifiers.propNames.indexOf(lastExcludeColName);

  const possibleModifiers = magicModifiers.rows.filter((row) => {
    const magicIncludes = new Set(
      row.slice(includedStart, includedEnd).filter((n) => !!n),
    );
    const magicExcludes = new Set(
      row.slice(excludedStart, excludedEnd).filter((n) => !!n),
    );
    const testIncludes = new Set([...magicIncludes, ...itemTypes]);
    const included = testIncludes.size < magicIncludes.size + itemTypes.size;
    const testExcludes = new Set([...magicExcludes, ...itemTypes]);
    const excluded = testExcludes.size < magicIncludes.size + itemTypes.size;
    return included && !excluded;
  });

  if (possibleModifiers.length > 0) {
    return getRandomRow(
      possibleModifiers,
      magicModifiers.propNames,
      (row, propNames, depth) =>
        parseInt(row[propNames.indexOf("frequency")] || "0") > 10 - depth,
    );
  }
  return "";
}

function getItemValue(item: RowData, propName: string) {
  return parseInt(getPropOfItem(item, propName) || "0");
}

export function generateItem(type: "Armor" | "Weapons") {
  // const data = getRandomRow(getDataRows('Armor'), (row, propNames, depth) => parseInt(row[propNames.indexOf('rarity')] || '0') <= depth)
  const weapons = getDataRows(type);
  const item = getRandomRow(
    weapons.rows,
    weapons.propNames,
    (row, propNames, depth) =>
      parseInt(row[propNames.indexOf("rarity")] || "99") <= depth,
  );
  const itemName = item.row[item.propNames.indexOf("name")];
  const itemType = getPropOfItem(item, "type");
  const types: string[] = [];
  unpackTypes(itemType, types);
  const itemTypes = new Set(types);
  const prefix = getMagicModifier("MagicPrefix", itemTypes, "etype5");

  const prefixName = prefix
    ? prefix.row[prefix.propNames.indexOf("Name")]
    : null;

  const suffix =
    Math.random() > 0.5
      ? getMagicModifier("MagicSuffix", itemTypes, "etype3")
      : "";

  const suffixName = suffix
    ? suffix.row[suffix.propNames.indexOf("Name")]
    : null;

  const fullName = [prefixName, itemName, suffixName]
    .filter((s) => !!s)
    .join(" ");

  const itemTypesData = getDataRows("ItemTypes");
  const iItemTypeName = itemTypesData.propNames.indexOf("ItemType");
  const iItemTypeCode = itemTypesData.propNames.indexOf("Code");
  const descriptors = types.map((type) => {
    const row = itemTypesData.rows.find((row) => row[iItemTypeCode] === type)!;
    return row[iItemTypeName];
  });
  const rarity = getItemValue(item, "rarity");
  const level =
    getItemValue(item, "level") +
    (prefix ? getItemValue(prefix, "level") : 0) +
    (suffix ? getItemValue(suffix, "level") : 0);
  const attributes =
    type === "Weapons"
      ? {
          rarity,
          level,
          speed: getItemValue(item, "speed"),
          strBonus: getItemValue(item, "StrBonus"),
          dexBonus: getItemValue(item, "DexBonus"),
          reqStr: getItemValue(item, "reqstr"),
          reqDex: getItemValue(item, "reqdex"),
          durability: getItemValue(item, "durability"),
          minDam: getItemValue(item, "mindam"),
          maxDam: getItemValue(item, "maxdam"),
          twoHandMinDam: getItemValue(item, "2handmindam"),
          twoHandMaxDam: getItemValue(item, "2handmaxdam"),
        }
      : {
          type: "armor",
          rarity,
          level,
          speed: getItemValue(item, "speed"),
          requiredStrength: getItemValue(item, "reqstr"),
          durability: getItemValue(item, "durability"),
        };
  return {
    name: fullName,
    type: type === "Weapons" ? "weapon" : "armor",
    description: `It can be described as a ${descriptors.join(", ")}`,
    attributes,
  };
}
