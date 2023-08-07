import { describe, it, expect } from 'bun:test';
import { Dictionary } from './dictionary';

describe('Dictionary', () => {
  const dictionary = new Dictionary();

  it('should explain a word', async () => {
    const result = await dictionary.explain('fire');
    // console.log(result);
    expect(result).toEqual({"definitions":[{"type":"noun","definition":["a state, process, or instance of combustion in which fuel or other material is ignited and combined with oxygen, giving off light, heat, and flame.","a burning mass of material, as on a hearth or in a furnace.","the destructive burning of a building, town, forest, etc.; conflagration.","heat used for cooking, especially the lighted burner of a stove: Put the kettle on the fire.","Greek fire. ","flashing light; luminous appearance.","brilliance, as of a gem.","burning passion; excitement or enthusiasm; ardor.","liveliness of imagination.","fever or inflammation.","severe trial or trouble; ordeal.","exposure to fire as a means of torture or ordeal.","strength, as of an alcoholic beverage.","a spark or sparks.","the discharge of firearms: enemy fire.","the effect of firing military weapons: to pour fire upon the enemy.","British. a gas or electric heater used for heating a room.","Literary. a luminous object, as a star: heavenly fires."]},{"type":"verb (used with object),","definition":["to set on fire.","to supply with fuel or attend to the fire of (often followed by up):They fired the boiler.","to expose to the action of fire; subject to heat.","to apply heat to in a kiln for baking or glazing; burn.","to heat very slowly for the purpose of drying, as tea.","to inflame, as with passion; fill with ardor (often followed by up).","to inspire.","to light or cause to glow as if on fire.","to discharge (a gun).","to project (a bullet or the like) by or as if by discharging from a gun.","to subject to explosion or explosive force, as a mine.","to cause (a device, machine, etc.) to start working (usually followed by up): I just fired up my new laptop.","to hurl; throw: to fire a stone through a window.","to dismiss from a job.","Veterinary Medicine. to apply a heated iron to (the skin) in order to create a local inflammation of the superficial structures, with the intention of favorably affecting deeper inflammatory processes.","to drive out or away by or as by fire."]},{"type":"verb (used without object),","definition":["to take fire; be kindled.","to glow as if on fire.","to become inflamed with passion; become excited.","to shoot, as a gun.","to discharge a gun: to fire at a fleeing enemy.","to hurl a projectile.","Music. to ring the bells of a chime all at once.","(of plant leaves) to turn yellow or brown before the plant matures.","(of an internal-combustion engine) to cause ignition of the air-fuel mixture in a cylinder or cylinders.","(of a nerve cell) to discharge an electric impulse."]},{"type":"adjective","definition":["Slang. cool, excellent, exciting, etc.: It would be so fire if we won those tickets!"]},{"type":"Verb Phrases","definition":["fire away, Informal. to begin to talk and continue without slackening, as to ask a series of questions: The reporters fired away at the president.",{"type":"fire off,  ","definition":["to discharge (as weapons, ammunition, etc.): Police fired off canisters of tear gas.","to write and send hurriedly: She fired off an angry letter to her congressman."]}]}],"ref":[{"def":"burning material","synonyms":["blaze","bonfire","heat","inferno","campfire","charring","coals","combustion","conflagration","devouring","element","embers","flames","flare","glow","hearth","holocaust","incandescence","luminosity","oxidation","phlogiston","pyre","scintillation","scorching","searing","sparks","tinder","warmth","flame and smoke","hot spot","rapid oxidation","sea of flames","up in smoke"]},{"def":"barrage of projectiles","synonyms":["attack","bombardment","bombing","explosion","shelling","bombarding","cannonade","cannonading","crossfire","fusillade","hail","round","salvo","sniping","volley"]},{"def":"animation, vigor","synonyms":["force","heat","light","ardor","brio","dash","drive","eagerness","energy","enthusiasm","excitement","exhilaration","fervency","fervor","ginger","gusto","heartiness","impetuosity","intensity","life","liveliness","luster","passion","pep","punch","radiance","scintillation","snap","sparkle","spirit","splendor","starch","verve","vim","virtuosity","vivacity","zeal","zing","zip","calenture","élan","red heat","white heat"]},{"def":"cause to burn","synonyms":["enkindle","ignite","kindle","light","put a match to","set ablaze","set aflame","set alight","set fire to","set on fire","start a fire","touch off"]},{"def":"detonate or throw a weapon","synonyms":["discharge","explode","hurl","launch","shoot","cast","eject","fling","heave","loose","pitch","shell","toss","let off","pull trigger","set off","touch off"]},{"def":"excite, arouse","synonyms":["animate","electrify","enliven","enthuse","exalt","galvanize","heighten","incite","inflame","inform","inspire","inspirit","intensify","intoxicate","irritate","provoke","quicken","rouse","stir","thrill","impassion"]},{"def":"dismiss from responsibility","synonyms":["discharge","drop","expel","oust","sack","terminate","ax","boot","can","eject","give bum's rush","give marching orders","give one notice","give pink slip","give the sack","hand walking papers","kick out","lay off","let one go","pink slip"]}],"use":["The Honeywell Safe line makes a variety of fire and waterproof lockable storage cabinets, each one made to stand extreme conditions.","The tragic 2018 mudslide in Montecito, California is just one example of a post-fire flood.","The strong winds and low humidity will continue to feed the fires, particularly in the northeast part of the blaze.","In an overnight filing, Apple said “Epic started a fire, and poured gasoline on it, and now asks this court for emergency assistance in putting it out.”","Make a fireThough it’s engineered to reduce exterior friction, paracord can still make a suitable bow string for the bow and drill fire-starting method.","But what is there more irresponsible than playing with the fire of an imagined civil war in the France of today?","The cameraman was reporting on the factory catching fire when the inevitable happened.","Lady Edith is so sad that her sadness nearly set the whole damned house on fire.","Maybe Mary is being more realistic about a second marriage—but is it too much to ask for a little fire?","A fire that he insists is only picking up pace, according to top-secret intelligence briefings.","\"A camp-fire would hardly flash and die out like that, Sarge,\" he answered thoughtfully.","She got up and stood in front of the fire, having her hand on the chimney-piece and looking down at the blaze.","The fire had been heaped over with earth—to screen it from prying eyes, I suppose, while the good work went on.","But, as the keel of the boats touched bottom, each boat-load dashed into the water and then into the enemy's fire.","The men, whose poniards his sword parried, had recourse to fire-arms, and two pistols were fired at him."],"idioms":[{"idiom":"between two fires","definition":["under physical or verbal attack from two or more sides simultaneously"],"example":["The senator is between two fires because of his stand on the bill."]},{"idiom":"build a fire under","definition":["to cause or urge to take action, make a decision quickly, or work faster"],"example":["If somebody doesn't build a fire under that committee, it will never reach a decision."],"label":"Informal"},{"idiom":"catch fire","definition":["to create enthusiasm"],"example":["His new book did not catch fire among his followers."]},{"idiom":"catch (on) fire","definition":["to become ignited;"],"example":["The sofa caught fire from a lighted cigarette.","The movie set nearly caught on fire when a fire-related special effect went out of control."]},{"idiom":"fight fire with fire","definition":["to use the same tactics as one's opponent; return like for like"],"example":[]},{"idiom":"go through fire and water","definition":["to brave any danger or endure any trial"],"example":["He said he would go through fire and water to win her hand."]},{"idiom":"hang fire","definition":["to be delayed in exploding, or fail to explode","to be undecided, postponed, or delayed"],"example":["The new housing project is hanging fire because of concerted opposition."]},{"idiom":"miss fire","definition":["to fail to explode or discharge, as a firearm","to fail to produce the desired effect; be unsuccessful"],"example":["He repeated the joke, but it missed fire the second time."]},{"idiom":"on fire","definition":["ignited; burning; afire","eager; ardent; zealous"],"example":["They were on fire to prove themselves in competition."]},{"idiom":"play with fire","definition":["to trifle with a serious or dangerous matter"],"example":["He didn't realize that insulting the border guards was playing with fire."]},{"idiom":"set fire to","form":"set on fire.","definition":["Also","to cause to burn; ignite","to excite; arouse; inflame"],"example":["The painting set fire to the composer's imagination."]},{"idiom":"take fire","definition":["to become ignited; burn","to become inspired with enthusiasm or zeal"],"example":["Everyone who heard him speak immediately took fire."]},{"idiom":"under fire","definition":["under attack, especially by military forces","under censure or criticism"],"example":["The school administration is under fire for its policies."]}]});
  });
});