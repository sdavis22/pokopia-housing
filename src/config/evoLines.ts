/**
 * Hardcoded evolution families for the 305 Pokemon in the dataset.
 * Each array is one evolutionary line — any two members are considered "same evo line".
 */
const EVO_FAMILIES: string[][] = [
  // Gen 1
  ['bulbasaur', 'ivysaur', 'venusaur'],
  ['charmander', 'charmeleon', 'charizard'],
  ['squirtle', 'wartortle', 'blastoise'],
  ['pidgey', 'pidgeotto', 'pidgeot'],
  ['ekans', 'arbok'],
  ['pichu', 'pikachu', 'raichu'],
  ['cleffa', 'clefairy', 'clefable'],
  ['vulpix', 'ninetales'],
  ['igglybuff', 'jigglypuff', 'wigglytuff'],
  ['zubat', 'golbat', 'crobat'],
  ['oddish', 'gloom', 'vileplume', 'bellossom'],
  ['paras', 'parasect'],
  ['venonat', 'venomoth'],
  ['diglett', 'dugtrio'],
  ['meowth', 'persian'],
  ['psyduck', 'golduck'],
  ['growlithe', 'arcanine'],
  ['poliwag', 'poliwhirl', 'poliwrath', 'politoed'],
  ['abra', 'kadabra', 'alakazam'],
  ['machop', 'machoke', 'machamp'],
  ['bellsprout', 'weepinbell', 'victreebel'],
  ['geodude', 'graveler', 'golem'],
  ['slowpoke', 'slowbro', 'slowking'],
  ['magnemite', 'magneton', 'magnezone'],
  ['grimer', 'muk'],
  ['gastly', 'haunter', 'gengar'],
  ['onix', 'steelix'],
  ['voltorb', 'electrode'],
  ['exeggcute', 'exeggutor'],
  ['cubone', 'marowak'],
  ['tyrogue', 'hitmonlee', 'hitmonchan', 'hitmontop'],
  ['koffing', 'weezing'],
  ['happiny', 'chansey', 'blissey'],
  ['tangela', 'tangrowth'],
  ['mime-jr', 'mr-mime'],
  ['scyther', 'scizor'],
  ['elekid', 'electabuzz', 'electivire'],
  ['magby', 'magmar', 'magmortar'],
  ['magikarp', 'gyarados'],
  ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
  ['porygon', 'porygon2', 'porygon-z'],
  ['dratini', 'dragonair', 'dragonite'],
  ['munchlax', 'snorlax'],
  ['bonsly', 'sudowoodo'],

  // Gen 2
  ['cyndaquil', 'quilava', 'typhlosion'],
  ['hoothoot', 'noctowl'],
  ['spinarak', 'ariados'],
  ['mareep', 'flaaffy', 'ampharos'],
  ['azurill', 'marill', 'azumarill'],
  ['hoppip', 'skiploom', 'jumpluff'],
  ['murkrow', 'honchkrow'],
  ['misdreavus', 'mismagius'],
  ['larvitar', 'pupitar', 'tyranitar'],
  ['duskull', 'dusclops', 'dusknoir'],
  ['riolu', 'lucario'],
  ['ralts', 'kirlia', 'gardevoir', 'gallade'],

  // Gen 3
  ['torchic', 'combusken', 'blaziken'],
  ['lotad', 'lombre', 'ludicolo'],
  ['wingull', 'pelipper'],
  ['makuhita', 'hariyama'],
  ['gulpin', 'swalot'],
  ['trapinch', 'vibrava', 'flygon'],
  ['cacnea', 'cacturne'],
  ['swablu', 'altaria'],
  ['beldum', 'metang', 'metagross'],

  // Gen 4
  ['piplup', 'prinplup', 'empoleon'],
  ['kricketot', 'kricketune'],
  ['cranidos', 'rampardos'],
  ['shieldon', 'bastiodon'],
  ['combee', 'vespiquen'],
  ['shellos', 'gastrodon'],
  ['drifloon', 'drifblim'],

  // Gen 5
  ['snivy', 'servine', 'serperior'],
  ['drilbur', 'excadrill'],
  ['timburr', 'gurdurr', 'conkeldurr'],
  ['trubbish', 'garbodor'],
  ['zorua', 'zoroark'],
  ['minccino', 'cinccino'],
  ['litwick', 'lampent', 'chandelure'],
  ['axew', 'fraxure', 'haxorus'],
  ['larvesta', 'volcarona'],

  // Gen 6
  ['froakie', 'frogadier', 'greninja'],
  ['tyrunt', 'tyrantrum'],
  ['amaura', 'aurorus'],
  ['goomy', 'sliggoo', 'goodra'],
  ['noibat', 'noivern'],

  // Gen 7
  ['rowlet', 'dartrix', 'decidueye'],
  ['grubbin', 'charjabug', 'vikavolt'],

  // Gen 8
  ['scorbunny', 'raboot', 'cinderace'],
  ['skwovet', 'greedent'],
  ['rookidee', 'corvisquire', 'corviknight'],
  ['rolycoly', 'carkol', 'coalossal'],
  ['toxel', 'toxtricity'],
  ['dreepy', 'drakloak', 'dragapult'],

  // Gen 9
  ['sprigatito', 'floragato', 'meowscarada'],
  ['pawmi', 'pawmo', 'pawmot'],
  ['fidough', 'dachsbun'],
  ['charcadet', 'armarouge', 'ceruledge'],
  ['wattrel', 'kilowattrel'],
  ['tinkatink', 'tinkatuff', 'tinkaton'],
  ['glimmet', 'glimmora'],
  ['girafarig', 'farigiraf'],
  ['gimmighoul', 'gholdengo'],
  ['paldean-wooper', 'clodsire'],
];

const idToFamily = new Map<string, number>();
EVO_FAMILIES.forEach((family, i) => {
  for (const id of family) {
    idToFamily.set(id, i);
  }
});

export function sameEvoLine(idA: string, idB: string): boolean {
  const famA = idToFamily.get(idA);
  const famB = idToFamily.get(idB);
  return famA !== undefined && famA === famB;
}

export function groupHasEvoLinePair(memberIds: string[]): boolean {
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      if (sameEvoLine(memberIds[i], memberIds[j])) return true;
    }
  }
  return false;
}
