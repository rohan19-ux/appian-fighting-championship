import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Award,
  ChevronDown,
  Menu,
  Search,
  Shield,
  Trophy,
  X,
} from 'lucide-react';

type FighterId = 'felix' | 'rohan' | 'adrian' | 'jack' | 'orlando' | 'byron' | 'constantine' | 'angus' | 'angus-carroll' | 'markus' | 'julian' | 'luca' | 'lachlan-cole';
type Stage = 'Round Robin' | 'Semifinal' | 'Final' | 'Fight Night 2';
type Method = 'Submission' | 'Decision' | 'Split Decision' | 'Disqualification' | 'No Contest' | 'Retirement';
type Fight = {
  id: string;
  stage: Stage;
  number?: number;
  a: FighterId;
  b: FighterId;
  winner: FighterId | null;
  method: Method;
  score?: string;
  reason?: string;
  round?: number;
};
const fighters: Record<
  FighterId,
  { name: string; initials: string; role?: string; note?: string }
> = {
  felix: {
    name: 'Felix Farah',
    initials: 'FF',
    role: 'AFC Heavyweight Champion · Inaugural AFC Welterweight Champion',
  },
  rohan: {
    name: 'Rohan Mather',
    initials: 'RM',
    role: 'AFC Heavyweight · Fight Night 1 Runner-up',
  },
  adrian: { name: 'Adrian Capolupo', initials: 'AC', role: 'AFC Heavyweight · Former Flyweight Champion' },
  jack: { name: 'Jack Campion', initials: 'JC', role: 'AFC Lightweight Champion' },
  orlando: { name: 'Orlando Maiolo', initials: 'OM' },
  byron: { name: 'Byron Barrett', initials: 'BB' },
  constantine: { name: 'Constantine Papadopolus', initials: 'CP' },
  angus: { name: 'Angus McCall', initials: 'AM' },
  'angus-carroll': { name: 'Angus Carroll', initials: 'AC', role: 'Newly signed AFC fighter' },
  markus: { name: 'Markus Goldschmitt', initials: 'MG', role: 'AFC Heavyweight · AFC Fight Night 2 replacement' },
  julian: { name: 'Julian Small', initials: 'JS', role: 'AFC Lightweight' },
  luca: { name: 'Luca Dukovski', initials: 'LD', role: 'AFC Lightweight' },
  'lachlan-cole': { name: 'Lachlan Cole', initials: 'LC', role: 'AFC Lightweight' },
};
const fighterDetails: Partial<Record<FighterId, { country: string; flag: string; gym: string }>> = {
  felix: { country: 'Lebanon', flag: '🇱🇧', gym: 'Integrated Fitness Burwood' },
  rohan: { country: 'Ireland', flag: '🇮🇪', gym: 'Inner Westside Jiu Jitsu' },
  adrian: { country: 'Italy', flag: '🇮🇹', gym: 'Anytime Fitness Haberfield' },
  'angus-carroll': { country: 'Australia', flag: '🇦🇺', gym: 'Anytime Fitness Willoughby' },
  markus: { country: 'Australia', flag: '🇦🇺', gym: 'Anytime Fitness Chatswood' },
  julian: { country: 'Australia', flag: '🇦🇺', gym: 'Combine Air Rozelle' },
  luca: { country: 'North Macedonia', flag: '🇲🇰', gym: 'C3 Training Drummoyne' },
  'lachlan-cole': { country: 'Australia', flag: '🇦🇺', gym: 'CrossFit Balmain' },
  jack: { country: 'Australia', flag: '🇦🇺', gym: 'Summer Hill Gym' },
  angus: { country: 'Australia', flag: '🇦🇺', gym: 'Legends Gym Kensington' },
  constantine: { country: 'Greece', flag: '🇬🇷', gym: 'Elevate Training Concord' },
  byron: { country: 'Australia', flag: '🇦🇺', gym: 'Inner Westside Jiu Jitsu' },
};

const fn3Matchups: Partial<Record<FighterId, string>> = {
  julian: 'Featured bout · vs Luca Dukovski',
  luca: 'Featured bout · vs Julian Small',
  constantine: 'Opening bout · vs Markus Goldschmitt',
  markus: 'Opening bout · vs Constantine Papadopolus · Co-main event · vs Angus McCall',
  angus: 'Co-main event · vs Markus Goldschmitt',
  rohan: 'Main event · vs Angus Carroll · Interim Lightweight Championship',
  'angus-carroll': 'Main event · vs Rohan Mather · Interim Lightweight Championship',
};

const fights: Fight[] = [
  {
    id: 'rr1',
    number: 1,
    stage: 'Round Robin',
    a: 'jack',
    b: 'adrian',
    winner: 'adrian',
    method: 'Submission',
  },
  {
    id: 'rr2',
    number: 2,
    stage: 'Round Robin',
    a: 'orlando',
    b: 'felix',
    winner: 'felix',
    method: 'Submission',
  },
  {
    id: 'rr3',
    number: 3,
    stage: 'Round Robin',
    a: 'felix',
    b: 'adrian',
    winner: 'felix',
    method: 'Submission',
  },
  {
    id: 'rr4',
    number: 4,
    stage: 'Round Robin',
    a: 'rohan',
    b: 'jack',
    winner: null,
    method: 'No Contest',
    reason: 'Accidental eye poke',
  },
  {
    id: 'rr5',
    number: 5,
    stage: 'Round Robin',
    a: 'orlando',
    b: 'rohan',
    winner: 'rohan',
    method: 'Disqualification',
    reason: 'Punching',
  },
  {
    id: 'rr6',
    number: 6,
    stage: 'Round Robin',
    a: 'felix',
    b: 'jack',
    winner: 'jack',
    method: 'Submission',
  },
  {
    id: 'rr7',
    number: 7,
    stage: 'Round Robin',
    a: 'adrian',
    b: 'orlando',
    winner: 'adrian',
    method: 'Submission',
  },
  {
    id: 'rr8',
    number: 8,
    stage: 'Round Robin',
    a: 'rohan',
    b: 'felix',
    winner: 'felix',
    method: 'Submission',
  },
  {
    id: 'rr9',
    number: 9,
    stage: 'Round Robin',
    a: 'adrian',
    b: 'rohan',
    winner: 'adrian',
    method: 'Decision',
    score: '1–0',
  },
  {
    id: 'rr10',
    number: 10,
    stage: 'Round Robin',
    a: 'jack',
    b: 'orlando',
    winner: 'orlando',
    method: 'Submission',
  },
  {
    id: 'semi',
    stage: 'Semifinal',
    a: 'rohan',
    b: 'adrian',
    winner: 'rohan',
    method: 'Decision',
    score: '1–0',
  },
  {
    id: 'final',
    stage: 'Final',
    a: 'felix',
    b: 'rohan',
    winner: 'felix',
    method: 'Submission',
  },
  {
    id: 'fn2-opening',
    stage: 'Fight Night 2',
    a: 'markus',
    b: 'constantine',
    winner: 'constantine',
    method: 'Retirement',
    reason: 'Official result · AFC Fight Night 2',
  },
  {
    id: 'fn2-flyweight-title', stage: 'Fight Night 2', a: 'rohan', b: 'adrian',
    winner: 'adrian', method: 'Submission', reason: 'Guillotine', round: 2,
  },
  {
    id: 'fn2-welterweight-title', stage: 'Fight Night 2', a: 'felix', b: 'constantine',
    winner: 'felix', method: 'Submission', reason: 'Rear naked choke', round: 2,
  },
  {
    id: 'fn2-featherweight-title', stage: 'Fight Night 2', a: 'jack', b: 'byron',
    winner: 'jack', method: 'Split Decision', score: '48–47',
  },
];
const records = Object.fromEntries(
  (Object.keys(fighters) as FighterId[]).map(id => {
    const bouts = fights.filter(f => f.a === id || f.b === id);
    return [
      id,
      {
        wins: bouts.filter(f => f.winner === id).length,
        losses: bouts.filter(f => f.winner !== null && f.winner !== id).length,
        nc: bouts.filter(f => f.method === 'No Contest').length,
        total: bouts.length,
      },
    ];
  })
) as Record<
  FighterId,
  { wins: number; losses: number; nc: number; total: number }
>;
const recordText = (id: FighterId) => {
  const r = records[id];
  return r.nc ? `${r.wins}–${r.losses}–${r.nc}` : `${r.wins}–${r.losses}`;
};

const fighterDivisions: Partial<Record<FighterId, 'Lightweight' | 'Heavyweight'>> = {
  jack: 'Lightweight', byron: 'Lightweight', 'angus-carroll': 'Lightweight',
  julian: 'Lightweight', luca: 'Lightweight', 'lachlan-cole': 'Lightweight',
  felix: 'Heavyweight', constantine: 'Heavyweight', angus: 'Heavyweight', markus: 'Heavyweight', adrian: 'Heavyweight', rohan: 'Heavyweight',
};

const divisionFighters = {
  Lightweight: ['jack', 'byron', 'angus-carroll', 'julian', 'lachlan-cole', 'luca'] as FighterId[],
  Heavyweight: ['felix', 'constantine', 'markus', 'angus', 'adrian', 'rohan'] as FighterId[],
};

const fn2FightDivisions: Partial<Record<FighterId, string>> = { rohan: 'Flyweight', jack: 'Featherweight' };
type NewsStory = {
  slug: string;
  category: string;
  date: string;
  title: string;
  deck: string;
  artLabel: string;
  artSubline: string;
  sections: { heading?: string; paragraphs: string[] }[];
  details: { label: string; value: string }[];
};

const newsStories: NewsStory[] = [
  {
    slug: 'afc-fight-night-4-mt-price-summit-arena',
    category: 'BREAKING NEWS · AFC FIGHT NIGHT 4',
    date: '26 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 4 WILL BE HOSTED AT MT PRICE SUMMIT ARENA',
    deck: 'AFC confirms its fourth Fight Night will take place at Mt Price Summit Arena, as the Fight Night series continues to grow.',
    artLabel: 'FIGHT NIGHT 4 CONFIRMED.',
    artSubline: 'MT PRICE SUMMIT ARENA',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship can confirm the venue for its fourth event: AFC Fight Night 4 will be hosted at Mt Price Summit Arena. The announcement marks the next destination for the promotion as the Fight Night series continues to build.',
          'Mt Price Summit Arena becomes the newest addition to the list of venues that have hosted AFC competition, following Appian Arena, Silkstone Park and Yerroulbin Reserve.'
        ]
      },
      {
        heading: 'THE FOURTH FIGHT NIGHT',
        paragraphs: [
          'Fight Night 4 will follow AFC Fight Night 3, which takes place at Yerroulbin Reserve in Birchgrove on Saturday 5 December 2026.',
          'The date, fight card, matchups and event start time for AFC Fight Night 4 have not yet been announced. AFC will release further details as arrangements are confirmed.'
        ]
      },
      {
        heading: 'NEXT STOP: MT PRICE SUMMIT ARENA',
        paragraphs: [
          'With the venue confirmed, attention now turns to preparing the fourth instalment of the Fight Night series. Supporters can expect further updates from AFC as planning continues.',
          'More announcements will follow as the promotion confirms the event date, fight card and additional details.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 4' },
      { label: 'Venue', value: 'Mt Price Summit Arena' },
      { label: 'Date', value: 'To be announced' },
      { label: 'Fight card and matchups', value: 'To be announced' },
      { label: 'Event start', value: 'To be announced' }
    ]
  },
  {
    slug: 'afc-division-restructure-lightweight-heavyweight',
    category: 'BREAKING NEWS · AFC DIVISION RESTRUCTURE',
    date: '20 NOVEMBER 2026',
    title: 'AFC ANNOUNCES MAJOR DIVISION RESTRUCTURE: LIGHTWEIGHT AND HEAVYWEIGHT',
    deck: 'Flyweight and Featherweight will combine to form Lightweight, while Welterweight is renamed Heavyweight. Adrian Capolupo vacates the Flyweight title and moves up, with Jack Campion recognised as Lightweight Champion.',
    artLabel: 'DIVISION RESTRUCTURE.',
    artSubline: 'LIGHTWEIGHT · HEAVYWEIGHT · NEW CHAPTER',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship has confirmed a major restructure of its divisional landscape, bringing the former Flyweight and Featherweight divisions together under one Lightweight banner and renaming Welterweight as Heavyweight.',
          'The changes mark a new chapter for AFC, with championship status and fighter pathways adjusted as the promotion moves into its next phase.'
        ]
      },
      {
        heading: 'FLYWEIGHT AND FEATHERWEIGHT MERGE',
        paragraphs: [
          'The Flyweight and Featherweight divisions will combine to create a single Lightweight division. The separate divisions will no longer operate independently.',
          'Jack Campion, the reigning Featherweight Champion, is recognised as the AFC Lightweight Champion following the restructure.'
        ]
      },
      {
        heading: 'ADRIAN CAPOLUPO VACATES AND MOVES UP',
        paragraphs: [
          'Adrian Capolupo has officially vacated the AFC Flyweight Championship. He will move to the newly renamed Heavyweight division and compete there going forward.',
          'AFC acknowledges Capolupo’s reign as its inaugural Flyweight Champion, following his championship victory at Fight Night 2.'
        ]
      },
      {
        heading: 'WELTERWEIGHT BECOMES HEAVYWEIGHT',
        paragraphs: [
          'The existing Welterweight division will be renamed Heavyweight. The division name change applies to the category formerly known as Welterweight, with Capolupo joining the division following his move up.',
          'Further details on the updated divisional rankings and future championship plans will be communicated by AFC when confirmed.'
        ]
      }
    ],
    details: [
      { label: 'New division', value: 'Lightweight · Flyweight + Featherweight' },
      { label: 'Lightweight Champion', value: 'Jack Campion' },
      { label: 'New division', value: 'Heavyweight · Formerly Welterweight' },
      { label: 'Adrian Capolupo', value: 'Flyweight title vacated · Moves to Heavyweight' },
      { label: 'Effective', value: '20 November 2026' }
    ]
  },
  {
    slug: 'breaking-constantine-papadopolus-awarded-retirement-win-fn2',
    category: 'BREAKING NEWS · AFC FIGHT NIGHT 2',
    date: '14 NOVEMBER 2026',
    title: 'BREAKING: MARKUS GOLDSCHMITT WITHDRAWS — CONSTANTINE AWARDED THE WIN',
    deck: 'With less than five hours’ notice before AFC Fight Night 2, Goldschmitt has withdrawn from the opening bout. Constantine Papadopolus is awarded the victory by retirement.',
    artLabel: 'RETIREMENT VICTORY.',
    artSubline: 'CONSTANTINE PAPADOPOPULUS · AFC FN2',
    sections: [
      {
        paragraphs: [
          'AFC can confirm that Markus Goldschmitt has withdrawn from his scheduled Welterweight opening bout against Constantine Papadopolus at AFC Fight Night 2. The withdrawal came with less than five hours’ notice before the event.',
          'With the bout unable to proceed, the official result is awarded to Constantine Papadopolus by method of retirement.'
        ]
      },
      {
        heading: 'OFFICIAL RESULT',
        paragraphs: [
          'CONSTANTINE PAPADOPOPULUS DEFEATS MARKUS GOLDSCHMITT BY RETIREMENT.',
          'The result has been entered into the official AFC records. Papadopolus is credited with the victory and Goldschmitt is credited with the loss.'
        ]
      },
      {
        heading: 'RECORDS UPDATED',
        paragraphs: [
          'Constantine Papadopolus moves to 1–0 in his AFC record. Markus Goldschmitt’s record becomes 0–1 following the retirement result.',
          'The remaining AFC Fight Night 2 card continues as scheduled.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2 · Saturday 14 November 2026' },
      { label: 'Bout', value: 'Opening bout · Welterweight' },
      { label: 'Original matchup', value: 'Markus Goldschmitt vs Constantine Papadopolus' },
      { label: 'Official result', value: 'Constantine Papadopolus won by retirement' },
      { label: 'Constantine record', value: '1–0' },
      { label: 'Markus record', value: '0–1' }
    ]
  },
  {
    slug: 'fight-day-afc-fight-night-2-complete-card',
    category: 'AFC NEWS · FIGHT DAY SPECIAL',
    date: '14 NOVEMBER 2026',
    title: 'FIGHT DAY: THE COMPLETE AFC FIGHT NIGHT 2 CARD',
    deck: 'Fight Day at Silkstone Park. Constantine Papadopolus has been awarded the opening-bout victory by retirement, with three championship contests remaining.',
    artLabel: 'FIGHT DAY.',
    artSubline: 'CAMPION VS BARRETT · 14 NOVEMBER 2026',
    sections: [
      { paragraphs: [
        'Fight Day has arrived. AFC Fight Night 2 takes place tonight, Saturday 14 November 2026, at Silkstone Park, Breakfast Point. The first contest is scheduled for 5:30 PM.',
        'The official card featured four bouts, including three championship contests. The opening Welterweight bout has now been decided by retirement, while the three championship contests remain on the running order.'
      ]},
      { heading: '01 · OPENING BOUT — WELTERWEIGHT · COMPLETED', paragraphs: [
        'CONSTANTINE PAPADOPOPULUS DEFEATS MARKUS GOLDSCHMITT BY RETIREMENT',
        'The opening bout was decided by retirement after Goldschmitt withdrew with less than five hours’ notice before the event. Papadopolus is credited with the win; Goldschmitt is credited with the loss.'
      ]},
      { heading: '02 · FLYWEIGHT CHAMPIONSHIP · FINAL', paragraphs: [
        'ADRIAN CAPOLUPO DEFEATS ROHAN MATHER BY GUILLOTINE · ROUND 2',
        'Capolupo claims the inaugural AFC Flyweight Championship with a second-round guillotine submission. His official record moves to 4–2, while Mather moves to 2–4–1.',
        'Mather competed at Flyweight for this event while remaining registered as a Featherweight.'
      ]},
      { heading: '03 · CO-MAIN EVENT — WELTERWEIGHT CHAMPIONSHIP · FINAL', paragraphs: [
        'FELIX FARAH DEFEATS CONSTANTINE PAPADOPOPULUS BY REAR NAKED CHOKE · ROUND 2',
        'Farah retains the Welterweight Championship with a second-round rear naked choke. The champion moves to 5–1, while Papadopolus finishes the evening at 1–2.'
      ]},
      { heading: '04 · MAIN EVENT — FEATHERWEIGHT CHAMPIONSHIP · FINAL', paragraphs: [
        'JACK CAMPION DEFEATS BYRON BARRETT · 48–47 SPLIT DECISION',
        'Campion wins the inaugural AFC Featherweight Championship after five rounds, taking the judges’ split decision 48–47. Campion moves to 2–2–1; Barrett’s AFC record is now 0–1.',
        'ONE MAIN EVENT. ONE INAUGURAL CHAMPION. JACK CAMPION.'
      ]},
      { heading: 'TONIGHT’S EVENT DETAILS', paragraphs: [
        'Saturday 14 November 2026 · Silkstone Park, Breakfast Point',
        'First contest: 5:30 PM',
        'All four bouts complete · Three inaugural/defended championships decided'
      ]},
      { heading: 'A NOTE ON THE ODDS', paragraphs: [
        'All odds shown are the promotional AFC matchup estimates already published for Fight Night 2. They are not a betting market.'
      ]}
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2: Campion vs Barrett' },
      { label: 'Date', value: 'Saturday 14 November 2026' },
      { label: 'Venue', value: 'Silkstone Park, Breakfast Point' },
      { label: 'First contest', value: '5:30 PM' },
      { label: 'Opening bout result', value: 'Constantine Papadopolus won by retirement' },
      { label: 'Flyweight Championship', value: 'Adrian Capolupo def. Rohan Mather · Guillotine · Round 2' },
      { label: 'Welterweight Championship', value: 'Felix Farah def. Constantine Papadopolus · Rear naked choke · Round 2' },
      { label: 'Main event', value: 'Jack Campion def. Byron Barrett · 48–47 split decision · Five rounds' }
    ]
  },

  {
    slug: 'afc-fight-night-2-official-results-event-recap',
    category: 'AFC NEWS · OFFICIAL EVENT RECAP',
    date: '15 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 2: OFFICIAL RESULTS & EVENT RECAP',
    deck: 'Three championships were decided at Silkstone Park as AFC Fight Night 2 delivered a night of major milestones for Adrian Capolupo, Felix Farah and Jack Campion.',
    artLabel: 'THREE CHAMPIONS CROWNED.',
    artSubline: 'AFC FIGHT NIGHT 2 · OFFICIAL RECAP',
    sections: [
      {
        paragraphs: [
          'AFC Fight Night 2 is officially complete. On Saturday 14 November, competitors gathered at Silkstone Park, Breakfast Point for a four-bout event featuring three championship contests across the Flyweight, Welterweight and Featherweight divisions.',
          'The night produced three championship outcomes, with Adrian Capolupo claiming the inaugural Flyweight title, Felix Farah retaining the Welterweight Championship and Jack Campion becoming the inaugural Featherweight Champion.'
        ]
      },
      {
        heading: 'THE OFFICIAL RESULTS',
        paragraphs: [
          'OPENING BOUT · WELTERWEIGHT: CONSTANTINE PAPADOPOPULUS DEFEATED MARKUS GOLDSCHMITT BY RETIREMENT. Goldschmitt withdrew with less than five hours’ notice before the event, and the result was awarded to Papadopolus.',
          'FLYWEIGHT CHAMPIONSHIP: ADRIAN CAPOLUPO DEFEATED ROHAN MATHER BY GUILLOTINE IN ROUND 2. Capolupo claimed the inaugural AFC Flyweight Championship.',
          'CO-MAIN EVENT · WELTERWEIGHT CHAMPIONSHIP: FELIX FARAH DEFEATED CONSTANTINE PAPADOPOPULUS BY REAR NAKED CHOKE IN ROUND 2. Farah retained his Welterweight Championship.',
          'MAIN EVENT · FEATHERWEIGHT CHAMPIONSHIP: JACK CAMPION DEFEATED BYRON BARRETT BY 48–47 SPLIT DECISION. After five rounds, Campion became the inaugural AFC Featherweight Champion.'
        ]
      },
      {
        heading: 'THREE CHAMPIONSHIP STORIES',
        paragraphs: [
          'Adrian Capolupo leaves Fight Night 2 as the first AFC Flyweight Champion after securing the guillotine submission against Rohan Mather. Jack Campion also made history, taking the Featherweight title by split decision in the main event.',
          'Felix Farah continued his reign at Welterweight, successfully defending his championship against Constantine Papadopolus. All three championship bouts were contested over five rounds.'
        ]
      },
      {
        heading: 'OFFICIAL RECORDS UPDATED',
        paragraphs: [
          'The Fight Night 2 results have been added to the official AFC records. Adrian Capolupo moves to 4–2; Rohan Mather to 2–4–1; Felix Farah to 5–1; Constantine Papadopolus to 1–2; Jack Campion to 2–2–1; Byron Barrett to 0–1; and Markus Goldschmitt to 0–1.',
          'The championship picture now features Adrian Capolupo as Flyweight Champion, Felix Farah as Welterweight Champion and Jack Campion as Featherweight Champion.'
        ]
      },
      {
        heading: 'THANK YOU, BREAKFAST POINT',
        paragraphs: [
          'AFC thanks everyone who attended and supported Fight Night 2 at Silkstone Park. The promotion also recognises the competitors, coaches, officials and everyone who helped bring the event together.',
          'With the second Fight Night now complete, attention turns to AFC Fight Night 3 at Yerroulbin Reserve, Birchgrove, scheduled for Saturday 5 December 2026. Further event details and fight announcements will follow.'
        ]
      },
      {
        heading: 'THE NIGHT IN SUMMARY',
        paragraphs: [
          'Four official results recorded. Three championship contests completed. Two inaugural divisional champions crowned. One title successfully defended.',
          'AFC Fight Night 2: Campion vs Barrett is now part of the official Appian Fighting Championship archive.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2: Campion vs Barrett' },
      { label: 'Date', value: 'Saturday 14 November 2026' },
      { label: 'Venue', value: 'Silkstone Park, Breakfast Point' },
      { label: 'Official results', value: 'Four results recorded' },
      { label: 'New champions', value: 'Adrian Capolupo · Jack Campion' },
      { label: 'Successful title defence', value: 'Felix Farah · Welterweight' },
      { label: 'Next event', value: 'AFC Fight Night 3 · Saturday 5 December 2026' }
    ]
  },
  {
    slug: 'afc-fight-night-3-co-main-event-announced',
    category: 'BREAKING NEWS · AFC FIGHT NIGHT 3 · FULL CARD',
    date: '16 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 3: FULL FIGHT CARD CONFIRMED',
    deck: 'Four bouts are confirmed for Yerroulbin Reserve, headlined by Rohan Mather vs Angus Carroll for the Interim Lightweight Championship.',
    artLabel: 'FULL CARD CONFIRMED.',
    artSubline: 'MATHER VS CARROLL · AFC FIGHT NIGHT 3',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship can confirm the complete four-bout lineup for AFC Fight Night 3, taking place Saturday 5 December 2026 at Yerroulbin Reserve, Birchgrove.',
          'The revised card features a rare double appearance for Markus Goldschmitt and an Interim Lightweight Championship main event. Each matchup brings a different test, with established experience on one side and unanswered questions on the other.'
        ]
      },
      {
        heading: '01 · OPENING BOUT',
        paragraphs: [
          'MARKUS GOLDSCHMITT VS CONSTANTINE PAPADOPOPULUS',
          'Goldschmitt’s standout advantage is his size: at 6 feet 2 inches, he carries a significant height and reach advantage. The question mark is experience, as his scheduled Fight Night 2 appearance ended in a withdrawal before the contest.',
          'Papadopolus showed against Felix Farah at Fight Night 2 that he is resilient and difficult to dismiss. His experience is a strength, while the considerable size difference is the obvious challenge he must overcome.'
        ]
      },
      {
        heading: '02 · FEATURED BOUT',
        paragraphs: [
          'JULIAN SMALL VS LUCA DUKOVSKI',
          'Small’s light rugby background is a useful athletic base and gives him some sporting experience to draw on. His question mark is how that background translates to AFC competition. Dukovski brings the clearer physical advantage: he is bigger and stronger, although his performance under AFC rules is still to be seen.',
          'Small’s background and Dukovski’s size make this a genuine contrast. Neither has an established AFC record yet, so the featured bout is also an opportunity to make a first impression.'
        ]
      },
      {
        heading: '03 · CO-MAIN EVENT',
        paragraphs: [
          'ANGUS McCALL VS MARKUS GOLDSCHMITT',
          'McCall brings a rugby background and a strong physical profile into the co-main event. His key strength is that sporting base, while the unknown is how it will translate into his first completed AFC appearance.',
          'Goldschmitt is listed at 6 feet 2 inches and has a clear height advantage to bring into the matchup. However, he also has no completed AFC contest on his record after withdrawing from his scheduled Fight Night 2 bout. With both men still to establish themselves in the competition area, this one carries plenty of uncertainty.'
        ]
      },
      {
        heading: '04 · MAIN EVENT · INTERIM FEATHERWEIGHT CHAMPIONSHIP',
        paragraphs: [
          'ROHAN MATHER VS ANGUS CARROLL',
          'Mather’s biggest strength is experience: he reached the inaugural Fight Night 1 final and represents Inner Westside Jiu Jitsu. His grappling background and previous AFC performances give him a proven base. The recent loss to Adrian Capolupo at Fight Night 2 is the result he will want to put behind him.',
          'Carroll brings a rugby background and enters with the opportunity to make a statement in his AFC appearance. That sporting experience is a potential strength, while the main unknown is how quickly he adapts to AFC competition. Mather has the record of experience; Carroll has the chance to show what his background can add.',
          'With the Interim Lightweight Championship on the line, the winner will take a major step in the division while reigning champion Jack Campion remains the titleholder.'
        ]
      },
      {
        heading: 'FIGHT NIGHT 3 DETAILS',
        paragraphs: [
          'Saturday 5 December 2026 · Yerroulbin Reserve · Birchgrove, NSW',
          'Admission: Free · Registration required',
          'Event start time: To be announced.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 3: Mather vs Carroll' },
      { label: 'Date', value: 'Saturday 5 December 2026' },
      { label: 'Venue', value: 'Yerroulbin Reserve · Birchgrove' },
      { label: 'Opening bout', value: 'Markus Goldschmitt vs Constantine Papadopolus' },
      { label: 'Featured bout', value: 'Julian Small vs Luca Dukovski' },
      { label: 'Co-main event', value: 'Angus McCall vs Markus Goldschmitt' },
      { label: 'Main event', value: 'Rohan Mather vs Angus Carroll · Interim Lightweight Championship' },
      { label: 'Admission', value: 'Free · Registration required' },
      { label: 'Event start', value: 'To be announced' }
    ]
  },
  {
    slug: 'afc-fight-night-3-yerrroulbin-reserve',
    category: 'BREAKING NEWS · AFC FIGHT NIGHT 3',
    date: '12 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 3 HEADED TO YERROULBIN RESERVE, BIRCHGROVE',
    deck: 'AFC confirms its third Fight Night will take place at Yerroulbin Reserve in Birchgrove, with at least one title fight guaranteed for the card.',
    artLabel: 'FIGHT NIGHT 3 CONFIRMED.',
    artSubline: 'YERROULBIN RESERVE · BIRCHGROVE',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship can confirm the location for its third event: AFC Fight Night 3 will be held at Yerroulbin Reserve in Birchgrove. The venue marks the next destination for the promotion as it continues to build its Fight Night series.',
          'AFC can also confirm that at least one title fight will feature on the Fight Night 3 card. Championship action is guaranteed to be part of the event, giving the night a major stakes contest.'
        ]
      },
      {
        heading: 'A TITLE FIGHT IS GUARANTEED',
        paragraphs: [
          'The Fight Night 3 lineup will include no fewer than one championship bout. The title division, competitors and exact matchup have not yet been announced, with further details to be confirmed as the card takes shape.',
          'The confirmed title-fight commitment means a championship will be on the line at Yerroulbin Reserve. AFC will release the full fight card and additional event information in a future announcement.'
        ]
      },
      {
        heading: 'NEXT STOP: BIRCHGROVE',
        paragraphs: [
          'Yerroulbin Reserve in Birchgrove will provide the setting for the promotion’s third Fight Night on Saturday 5 December 2026. Following the first two events, AFC now turns its attention to preparing another card for its competitors and supporters.',
          'The event is scheduled for Saturday 5 December 2026. The start time and remaining matchups are still to be announced. Supporters can expect further updates from AFC as preparations continue.'
        ]
      },
      {
        heading: 'THE ROAD TO AFC FN3',
        paragraphs: [
          'With the venue confirmed and at least one championship contest secured for the card, the countdown to AFC Fight Night 3 begins. More announcements will follow as the promotion confirms the remaining details.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 3' },
      { label: 'Venue', value: 'Yerroulbin Reserve' },
      { label: 'Location', value: 'Birchgrove, NSW' },
      { label: 'Date', value: 'Saturday 5 December 2026' },
      { label: 'Championship bouts', value: 'At least one confirmed' },
      { label: 'Fight card', value: 'Further matchups to be announced' },
      { label: 'Start time', value: 'To be announced' }
    ]
  },
  {
    slug: 'luca-duk-signs-with-afc',
    category: 'AFC NEWS · FIGHTER SIGNING',
    date: '11 NOVEMBER 2026',
    title: 'LUCA DUKOVSKI SIGNS WITH APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC welcomes North Macedonian Flyweight Luca Dukovski to the promotion, representing C3 Training Drummoyne.',
    artLabel: 'NEW SIGNING.',
    artSubline: 'LUCA DUKOVSKI · FLYWEIGHT',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship is pleased to announce the signing of Luca Dukovski to the AFC roster. Dukovski joins the promotion as a Flyweight and represents North Macedonia.',
          'Dukovski fights out of C3 Training Drummoyne. His signing is reflected across the official AFC fighter directory, Flyweight division listings and rankings.'
        ]
      },
      {
        heading: 'A NEW FLYWEIGHT JOINS AFC',
        paragraphs: [
          'Luca Dukovski becomes the latest addition to the AFC Flyweight division. His official fighter profile records his North Macedonian representation and his training base at C3 Training Drummoyne.',
          'Dukovski enters the official AFC Flyweight rankings at number three, behind Adrian Capolupo at number one and Jack Campion at number two.',
          'AFC welcomes Luca to the organisation and looks forward to following his progress. No bout or event appearance has been announced for Dukovski at this time.'
        ]
      },
      {
        heading: 'WELCOME TO THE ROSTER',
        paragraphs: [
          'Every new signing adds another chapter to the growth of Appian Fighting Championship. AFC is pleased to welcome Luca Dukovski and wishes him the best as he begins his journey with the promotion.'
        ]
      }
    ],
    details: [
      { label: 'Fighter', value: 'Luca Dukovski' },
      { label: 'Status', value: 'Signed to AFC' },
      { label: 'Division', value: 'Flyweight' },
      { label: 'Ranking', value: 'No. 3 · AFC Flyweight' },
      { label: 'Country', value: 'North Macedonia' },
      { label: 'Fights out of', value: 'C3 Training Drummoyne' }
    ]
  },
  {
    slug: 'julian-small-signs-with-afc',
    category: 'AFC NEWS · FIGHTER SIGNING',
    date: '11 NOVEMBER 2026',
    title: 'JULIAN SMALL SIGNS WITH APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC welcomes Australian Featherweight Julian Small to the promotion, representing Combine Air Rozelle.',
    artLabel: 'NEW SIGNING.',
    artSubline: 'JULIAN SMALL · FEATHERWEIGHT',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship is pleased to announce the signing of Julian Small to the AFC roster. The Australian competitor joins the promotion as a Featherweight, adding another name to the division.',
          'Small represents Australia and fights out of Combine Air Rozelle. His signing is now reflected across the official AFC fighter directory, division listings and rankings.'
        ]
      },
      {
        heading: 'A NEW FEATHERWEIGHT JOINS AFC',
        paragraphs: [
          'Julian Small becomes the latest addition to the AFC Featherweight division. His official fighter profile records his Australian representation and his training base at Combine Air Rozelle.',
          'Small enters the official AFC Featherweight rankings at number four. He joins the ranked division behind Rohan Mather, Byron Barrett and Angus Carroll.',
          'AFC welcomes Julian to the organisation and looks forward to following his progress. No bout or event appearance has been announced for Small at this time.'
        ]
      },
      {
        heading: 'WELCOME TO THE ROSTER',
        paragraphs: [
          'Every new signing adds another chapter to the growth of Appian Fighting Championship. AFC is pleased to welcome Julian Small and wishes him the best as he begins his journey with the promotion.'
        ]
      }
    ],
    details: [
      { label: 'Fighter', value: 'Julian Small' },
      { label: 'Status', value: 'Signed to AFC' },
      { label: 'Division', value: 'Featherweight' },
      { label: 'Ranking', value: 'No. 4 · AFC Featherweight' },
      { label: 'Country', value: 'Australia' },
      { label: 'Fights out of', value: 'Combine Air Rozelle' }
    ]
  },

  {
    slug: 'lachlan-cole-signs-with-afc',
    category: 'AFC NEWS · FIGHTER SIGNING',
    date: '17 NOVEMBER 2026',
    title: 'LACHLAN COLE SIGNS WITH APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC welcomes Australian Flyweight Lachlan Cole to the roster, ranked third in the division and likely to make his debut at Fight Night 3.',
    artLabel: 'NEW SIGNING.',
    artSubline: 'LACHLAN COLE · AUSTRALIA',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship is pleased to announce the signing of Australian competitor Lachlan Cole to the AFC roster.',
          'Cole represents Australia and fights out of CrossFit Balmain. He has been assigned to the Flyweight division and enters the official AFC rankings at number three.'
        ]
      },
      {
        heading: 'A POSSIBLE FIGHT NIGHT 3 DEBUT',
        paragraphs: [
          'Cole is likely to make his AFC debut at AFC Fight Night 3 on Saturday 5 December 2026 at Yerroulbin Reserve, Birchgrove.',
          'His appearance at the event is not yet confirmed. AFC has not announced an opponent or bout position for Cole, and further details will be shared if his debut is finalised.'
        ]
      },
      {
        heading: 'WELCOME TO AFC',
        paragraphs: [
          'AFC welcomes Lachlan Cole to the organisation and looks forward to following his progress as he prepares for the next chapter of his competition career.'
        ]
      }
    ],
    details: [
      { label: 'Fighter', value: 'Lachlan Cole' },
      { label: 'Status', value: 'Signed to AFC' },
      { label: 'Country', value: 'Australia' },
      { label: 'Fights out of', value: 'CrossFit Balmain' },
      { label: 'Division', value: 'Flyweight' },
      { label: 'Ranking', value: 'No. 3 · AFC Flyweight' },
      { label: 'Likely debut', value: 'AFC Fight Night 3 · Not yet confirmed' }
    ]
  },
  {
    slug: 'orlando-maiolo-released-from-afc',
    category: 'AFC NEWS · ROSTER UPDATE',
    date: '10 NOVEMBER 2026',
    title: 'ORLANDO MAIOLO RELEASED FROM APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC confirms Orlando Maiolo has been released from the promotion following his four-bout campaign at the inaugural AFC Fight Night 1.',
    artLabel: 'ROSTER UPDATE.',
    artSubline: 'ORLANDO MAIOLO · AFC FIGHT NIGHT 1',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship can confirm that Orlando Maiolo has been released from the AFC roster. The decision brings his time with the promotion to a close following his appearance at the inaugural AFC Fight Night on 19 September 2026.',
          'Maiolo was one of the five competitors who took part in the original Fight Night 1 round-robin competition at Appian Arena. Across four bouts, he experienced both the highs and challenges of tournament competition, finishing the event with an official record of one win and three losses.',
          'AFC recognises the effort it takes to step onto the competition area and compete in a demanding event. While this chapter has come to an end, the promotion wants to acknowledge Maiolo’s contribution to the first AFC Fight Night.'
        ]
      },
      {
        heading: 'A LOOK BACK AT FIGHT NIGHT 1',
        paragraphs: [
          'Maiolo’s campaign began against Felix Farah. The bout ended in a submission victory for Farah, who would go on to win the tournament final and become the inaugural AFC champion.',
          'His next contest was against Rohan Mather. That match was officially recorded as a disqualification victory for Mather after prohibited punching. The result counted as a loss for Maiolo in the official Fight Night 1 standings.',
          'Maiolo then faced Adrian Capolupo, with Capolupo taking the win by submission. Despite the setback, Maiolo returned for his final round-robin contest against Jack Campion.',
          'That final appearance produced Maiolo’s victory of the night. He defeated Campion by submission, securing a win on the inaugural AFC card and ensuring his tournament campaign included a positive result.'
        ]
      },
      {
        heading: 'ONE WIN, THREE LOSSES – AND A PLACE IN AFC HISTORY',
        paragraphs: [
          'Maiolo completed Fight Night 1 with a 1–3 record across four round-robin bouts. The numbers tell only part of the story: he competed against a group that included the eventual champion, the runner-up and other experienced members of the original AFC field.',
          'His submission win over Campion remains part of the official AFC record books, just as the results against Farah, Mather and Capolupo do. All four contests helped shape the first event and contributed to the tournament that established the promotion’s early history.',
          'AFC will retain the official Fight Night 1 results and records. This roster decision does not change the historical results of any bout.'
        ]
      },
      {
        heading: 'WHY AFC IS MOVING ON',
        paragraphs: [
          'The promotion has made the decision to move in a different direction with its active roster. The decision is an organisational one, and AFC will not speculate publicly about personal matters or add details that have not been confirmed.',
          'AFC’s focus remains on building its divisions and preparing competitors for future events. As the organisation develops, roster decisions will form part of ensuring the promotion continues to move forward.'
        ]
      },
      {
        heading: 'THANK YOU, ORLANDO',
        paragraphs: [
          'AFC would like to thank Orlando Maiolo for being part of the promotion’s first event and for helping make Fight Night 1 a memorable starting point. Being one of the original five competitors means his name will remain part of the organisation’s early history.',
          'We appreciate the time and effort he gave to the event, congratulate him on his victory over Jack Campion, and wish him all the best in whatever comes next.',
          'Thank you for being part of AFC Fight Night 1, Orlando.'
        ]
      }
    ],
    details: [
      { label: 'Fighter', value: 'Orlando Maiolo' },
      { label: 'Roster status', value: 'Released from AFC' },
      { label: 'Last event', value: 'AFC Fight Night 1 · 19 September 2026' },
      { label: 'Official record', value: '1–3 · Four round-robin bouts' },
      { label: 'AFC victory', value: 'Submission win over Jack Campion' }
    ]
  },
  {
    slug: 'breaking-markus-goldschmitt-replaces-angus-mccall-fn2',
    category: 'BREAKING NEWS · AFC FIGHT NIGHT 2',
    date: '11 NOVEMBER 2026',
    title: 'BREAKING: MARKUS GOLDSCHMITT REPLACES ANGUS McCALL AT AFC FN2',
    deck: 'AFC confirms Markus Goldschmitt as the replacement for Angus McCall, keeping Constantine Papadopolus on the Fight Night 2 card in the opening Welterweight bout.',
    artLabel: 'REPLACEMENT CONFIRMED.',
    artSubline: 'MARKUS GOLDSCHMITT · WELTERWEIGHT',
    sections: [
      {
        paragraphs: [
          'AFC can confirm that Markus Goldschmitt will replace Angus McCall in the opening bout at AFC Fight Night 2. McCall has withdrawn from the event, and the promotion has now secured a replacement to keep the Welterweight matchup on the card.',
          'Goldschmitt will face Constantine Papadopolus in the first contest of the evening on Saturday 14 November at Silkstone Park, Breakfast Point.'
        ]
      },
      {
        heading: 'MEET THE REPLACEMENT',
        paragraphs: [
          'Goldschmitt represents Australia and fights out of Anytime Fitness Chatswood. He joins the AFC roster as a Welterweight and steps into the opening-bout spot following McCall’s withdrawal.',
          'The replacement keeps Papadopolus’s opening assignment in place. He is still scheduled to compete twice on the night, first against Goldschmitt and later against reigning Welterweight Champion Felix Farah.'
        ]
      },
      {
        heading: 'THE OPENING BOUT IS BACK ON',
        paragraphs: [
          'With Goldschmitt now confirmed, AFC Fight Night 2 retains its four-bout schedule and three championship contests. The opening Welterweight matchup is now Markus Goldschmitt vs Constantine Papadopolus.',
          'AFC thanks Markus for stepping in and helping keep the contest on the card, and wishes Angus McCall well following his withdrawal.'
        ]
      },
      {
        heading: 'FIGHT NIGHT 2 DETAILS',
        paragraphs: [
          'AFC Fight Night 2 takes place on Saturday 14 November 2026 at Silkstone Park, Breakfast Point. The event begins at 5:30 PM.',
          'The remaining bouts and championship matchups are unchanged.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2 · Saturday 14 November 2026' },
      { label: 'Opening bout', value: 'Markus Goldschmitt vs Constantine Papadopolus' },
      { label: 'Division', value: 'Welterweight' },
      { label: 'Replacement', value: 'Markus Goldschmitt replaces Angus McCall' },
      { label: 'Country', value: 'Australia' },
      { label: 'Fights out of', value: 'Anytime Fitness Chatswood' },
      { label: 'Event start', value: '5:30 PM' }
    ]
  },

  {
    slug: 'fight-breakdown-mccall-vs-papadopolus',
    category: 'AFC NEWS · FIGHT NIGHT 2 · MATCH PREVIEW',
    date: '11 NOVEMBER 2026',
    title: 'FIGHT PREVIEW: GOLDSCHMITT VS PAPADOPOULUS',
    deck: 'Goldschmitt’s height advantage makes him the favourite against Papadopolus, who faces a tougher assignment than the original McCall matchup.',
    artLabel: 'THE HEIGHT ADVANTAGE.',
    artSubline: 'GOLDSCHMITT VS PAPADOPOULUS · FN2',
    sections: [
      {
        paragraphs: [
          'The opening bout at AFC Fight Night 2 has taken on a new dimension. Markus Goldschmitt is set to face Constantine Papadopolus after stepping in to replace Angus McCall, and the matchup now presents a significant challenge for Papadopolus.'
        ]
      },
      {
        heading: 'GOLDSCHMITT’S HEIGHT ADVANTAGE',
        paragraphs: [
          'Goldschmitt’s height advantage stands out as one of the biggest factors heading into this contest. The difference in stature could put Papadopolus at a major disadvantage, making this a difficult opening assignment for the Greek Welterweight.',
          'Goldschmitt will be looking to make an immediate statement in his AFC debut. He represents Australia and fights out of Anytime Fitness Chatswood.'
        ]
      },
      {
        heading: 'A TOUGHER TEST FOR PAPADOPOULUS',
        paragraphs: [
          'The original matchup with Angus McCall looked like a considerably easier assignment for Papadopolus. The change to Goldschmitt has made the opening bout much more complicated, and Constantine now faces a serious challenge before his later championship contest against Felix Farah.',
          'Papadopolus will need to find a way to deal with Goldschmitt’s physical advantage if he is to cause an upset and get his night off to a winning start.'
        ]
      },
      {
        heading: 'THE AFC ODDS',
        paragraphs: [
          'Goldschmitt enters at -350 FAV, while Papadopolus is priced at +500 DOG. The odds reflect the difficult task facing Papadopolus, but he will have the opportunity to prove the predictions wrong when the opening bell sounds.'
        ]
      },
      {
        heading: 'FIGHT NIGHT 2',
        paragraphs: [
          'Saturday 14 November. 5:30 PM. Silkstone Park, Breakfast Point.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Bout', value: 'Opening bout · Welterweight' },
      { label: 'Matchup', value: 'Markus Goldschmitt vs Constantine Papadopolus' },
      { label: 'Replacement', value: 'Goldschmitt replaces Angus McCall' },
      { label: 'Country', value: 'Australia' },
      { label: 'Fights out of', value: 'Anytime Fitness Chatswood' },
      { label: 'AFC odds', value: 'Goldschmitt -350 FAV · Papadopolus +500 DOG' }
    ]
  },
  {
    slug: 'fight-breakdown-capolupo-vs-mather-trilogy',
    category: 'AFC NEWS · FIGHT NIGHT 2 · MATCH PREVIEW',
    date: '10 NOVEMBER 2026',
    title: 'FIGHT BREAKDOWN: CAPOLUPO VS MATHER – THE TRILOGY',
    deck: 'With one victory apiece, Adrian Capolupo and Rohan Mather meet for the third time with the inaugural Flyweight Championship on the line.',
    artLabel: 'THE TRILOGY.',
    artSubline: 'CAPOLUPO VS MATHER · FN2',
    sections: [
      {
        paragraphs: [
          'One of the most anticipated matchups heading into AFC Fight Night 2 sees Adrian Capolupo face Rohan Mather in what is becoming a heated rivalry. With both fighters having already claimed a victory over the other, this third meeting could finally settle the score.'
        ]
      },
      {
        heading: 'CAPOLUPO – THE STRENGTH ADVANTAGE',
        paragraphs: [
          'Capolupo comes into this contest with a significant strength advantage. Having won their first encounter by submission, Adrian has already demonstrated his ability to finish Mather. He will be looking to use his physical strength and grappling ability to control the matchup once again.'
        ]
      },
      {
        heading: 'MATHER – THE SIZE ADVANTAGE',
        paragraphs: [
          'Mather may be giving up some strength, but he has the advantage in height and overall size. He also enters with momentum after winning their second encounter in a close judges’ decision. He will be looking to prove that victory was no fluke and silence any doubts surrounding the result.'
        ]
      },
      {
        heading: 'AFC FIGHT ODDS',
        paragraphs: [
          'Adrian Capolupo: -250 (Favourite)',
          'Rohan Mather: +200 (Underdog)'
        ]
      },
      {
        heading: 'AFC PREDICTION',
        paragraphs: [
          'Capolupo enters as a clear favourite, with his strength and previous submission victory making him a difficult opponent. However, Mather has already shown he can beat Adrian, and his height and size could cause problems.',
          'With the rivalry tied at one victory apiece, there is plenty on the line.',
          'One rivalry. Two previous battles. One chance to settle the score.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Bout', value: 'Flyweight Championship' },
      { label: 'Matchup', value: 'Adrian Capolupo vs Rohan Mather' },
      { label: 'AFC odds', value: 'Capolupo -250 FAV · Mather +200 DOG' }
    ]
  },
  {
    slug: 'fight-breakdown-farah-vs-papadopolus',
    category: 'AFC NEWS · FIGHT NIGHT 2 · MATCH PREVIEW',
    date: '10 NOVEMBER 2026',
    title: 'FIGHT BREAKDOWN: FARAH VS PAPADOPOULUS – THE FAVOURITE',
    deck: 'The reigning Welterweight Champion enters the co-main event as the strongest favourite on the AFC FN2 card.',
    artLabel: 'THE FAVOURITE.',
    artSubline: 'FARAH VS PAPADOPOULUS · FN2',
    sections: [
      {
        paragraphs: [
          'Felix Farah enters his matchup against Papadopolus as arguably the biggest favourite on the entire AFC FN2 card. With advantages in both strength and cardio, Farah appears to have the upper hand heading into Saturday.'
        ]
      },
      {
        heading: 'FARAH – THE COMPLETE PACKAGE',
        paragraphs: [
          'Farah is widely regarded as one of AFC’s best fighters. Combining superior physical strength with excellent cardio, Farah has the ability to maintain pressure throughout the contest. His overall skill and experience make him an extremely difficult opponent to overcome.'
        ]
      },
      {
        heading: 'PAPADOPOULUS – THE UNDERDOG',
        paragraphs: [
          'Papadopolus faces a massive challenge. He will need to find a way to overcome Farah’s physical advantages and disrupt his rhythm. While an upset is always possible, Papadopolus will need an exceptional performance to pull it off.'
        ]
      },
      {
        heading: 'AFC FIGHT ODDS',
        paragraphs: [
          'Felix Farah: -1000 (Favourite)',
          'Papadopolus: +650 (Underdog)'
        ]
      },
      {
        heading: 'AFC PREDICTION',
        paragraphs: [
          'Farah is expected to control this matchup from the opening stages. His strength, endurance and overall ability make him the clear favourite.',
          'An upset cannot be completely ruled out, but it would take a major surprise to stop Farah.',
          'Farah is the favourite. Papadopolus has everything to prove.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Bout', value: 'Welterweight Championship · Co-main event' },
      { label: 'Matchup', value: 'Felix Farah vs Constantine Papadopolus' },
      { label: 'AFC odds', value: 'Farah -1000 FAV · Papadopolus +650 DOG' }
    ]
  },
  {
    slug: 'main-event-breakdown-campion-vs-barrett',
    category: 'AFC NEWS · FIGHT NIGHT 2 · MAIN EVENT PREVIEW',
    date: '10 NOVEMBER 2026',
    title: 'MAIN EVENT BREAKDOWN: CAMPION VS BARRETT – A PICK’EM SHOWDOWN',
    deck: 'Two different strengths, even odds and the inaugural Featherweight Championship on the line.',
    artLabel: 'PICK’EM SHOWDOWN.',
    artSubline: 'CAMPION VS BARRETT · FN2',
    sections: [
      {
        paragraphs: [
          'The main event of AFC Fight Night 2 sees Jack Campion take on Byron Barrett in what promises to be one of the most competitive matchups on the card. With both fighters bringing different strengths, this is a difficult fight to predict.'
        ]
      },
      {
        heading: 'BARRETT – THE RUGBY BACKGROUND',
        paragraphs: [
          'Byron Barrett comes into this matchup with a rugby background, which could give him an advantage in physicality and takedowns. His experience in contact situations could help him close the distance and use his strength to control the contest.'
        ]
      },
      {
        heading: 'CAMPION – THE EXPERIENCE ADVANTAGE',
        paragraphs: [
          'Jack Campion, however, brings more experience into the matchup. That experience could prove crucial, particularly when dealing with Barrett’s physical approach. Jack will need to use his experience and composure to avoid being controlled and dictate the pace of the contest.'
        ]
      },
      {
        heading: 'AFC FIGHT ODDS',
        paragraphs: [
          'Jack Campion: -110 (Pick’em)',
          'Byron Barrett: -110 (Pick’em)'
        ]
      },
      {
        heading: 'AFC PREDICTION',
        paragraphs: [
          'This is a genuine pick’em matchup. Barrett has the physical tools and rugby background to make life difficult for Campion, but Jack’s experience could be the deciding factor.',
          'Neither fighter enters as the favourite or underdog. Both are considered equally matched, making this one of the hardest fights on the card to call.',
          'Two fighters. Two different strengths. One main event. Who takes the AFC FN2 headline victory?'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Bout', value: 'Featherweight Championship · Main event' },
      { label: 'Matchup', value: 'Jack Campion vs Byron Barrett' },
      { label: 'AFC odds', value: 'Campion -110 PICK’EM · Barrett -110 PICK’EM' }
    ]
  },
  {
    slug: 'official-spectator-guide-afc-fight-night-2',
    category: 'AFC OFFICIAL ANNOUNCEMENT · SPECTATOR INFORMATION',
    date: '13 NOVEMBER 2026',
    title: 'OFFICIAL SPECTATOR GUIDE: AFC FIGHT NIGHT 2',
    deck: 'Everything spectators need to know before arriving at Silkstone Park tomorrow, including viewing areas, road closures, public transport and hotel shuttles.',
    artLabel: 'SPECTATOR GUIDE.',
    artSubline: 'AFC FIGHT NIGHT 2 · 14 NOVEMBER 2026',
    sections: [
      {
        paragraphs: [
          'AFC Fight Night 2 takes place tomorrow, Saturday 14 November, at Silkstone Park, Breakfast Point, with the first contest scheduled for 5:30 PM.',
          'With road closures, dedicated spectator areas, food trucks, merchandise stalls and hospitality access in place, spectators are encouraged to familiarise themselves with the following arrangements before arriving.'
        ]
      },
      {
        heading: 'EVENT INFORMATION',
        paragraphs: [
          'Event: AFC Fight Night 2',
          'Date: Saturday, 14 November 2026',
          'Venue: Silkstone Park, Breakfast Point',
          'First contest: 5:30 PM',
          'General Admission viewing: Rosewater Circuit',
          'Hospitality access: Inside Silkstone Park'
        ]
      },
      {
        heading: 'GENERAL ADMISSION',
        paragraphs: [
          'General Admission spectators will watch the competition from Rosewater Circuit, which will be closed to traffic for the event.',
          'Palm Avenue will also be closed and transformed into an event precinct, featuring food trucks and AFC merchandise stalls.'
        ]
      },
      {
        heading: 'HOSPITALITY TICKETS',
        paragraphs: [
          'Hospitality ticket holders will have access to the actual Silkstone Park venue.',
          'Hospitality guests will also be able to exit towards Breakfast Point IGA to purchase food.',
          'Please have your hospitality ticket available upon arrival.'
        ]
      },
      {
        heading: 'TRANSPORT AND ROAD CLOSURES',
        paragraphs: [
          'PUBLIC TRANSPORT IS STRONGLY RECOMMENDED.',
          'Breakfast Point will have significant traffic restrictions during the event. Local roads will be closed to general traffic, with access retained for residents.',
          'Recommended services:',
          'F3 ferry: Travel to Cabarita Wharf.',
          'Bus 466: Travel towards Cabarita Junction.',
          'Bus 502: Travel towards Cabarita Junction.',
          'Please allow additional time for your journey. Driving into the event area is not recommended.'
        ]
      },
      {
        heading: 'ALBION HOTEL SHUTTLE SERVICE',
        paragraphs: [
          'Spectators staying at the Albion Hotel will have access to a dedicated shuttle service operating every 15 minutes between the hotel and the venue.',
          'Please be aware that AFC competitors and their coaching teams will also be staying at the Albion Hotel.',
          'As a result, spectators may experience delays to shuttle services following the conclusion of the event, as competitors and coaches return to the hotel.',
          'Spectators are encouraged to allow additional time for their return journey and be patient with shuttle operations.'
        ]
      },
      {
        heading: 'FOOD AND MERCHANDISE',
        paragraphs: [
          'Palm Avenue will host the event’s dedicated food and merchandise precinct, featuring food trucks and AFC merchandise stalls.',
          'Hospitality ticket holders will also have access to Breakfast Point IGA via the designated exit from Silkstone Park.'
        ]
      },
      {
        heading: 'IMPORTANT REMINDERS',
        paragraphs: [
          'Fight Night is TOMORROW, Saturday 14 November.',
          'First contest begins at 5:30 PM.',
          'General Admission viewing is from Rosewater Circuit.',
          'Hospitality ticket holders have access inside Silkstone Park.',
          'Palm Avenue and Rosewater Circuit will be closed to traffic.',
          'Breakfast Point will have restricted vehicle access.',
          'Public transport is strongly recommended.',
          'Albion Hotel shuttles operate every 15 minutes, but delays may occur after the event.'
        ]
      },
      {
        heading: 'SEE YOU TOMORROW',
        paragraphs: [
          'We look forward to welcoming spectators, competitors and coaches to Breakfast Point.',
          'Tomorrow, we make history. See you at Silkstone Park.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Date', value: 'Saturday 14 November 2026' },
      { label: 'Venue', value: 'Silkstone Park, Breakfast Point' },
      { label: 'First contest', value: '5:30 PM' },
      { label: 'General Admission', value: 'Rosewater Circuit' },
      { label: 'Hospitality', value: 'Inside Silkstone Park' },
      { label: 'Hotel shuttle', value: 'Every 15 minutes · delays possible after event' }
    ]
  },
  {
    slug: 'angus-carroll-signs-with-afc',
    category: 'AFC NEWS · FIGHTER SIGNING',
    date: '10 NOVEMBER 2026',
    title: 'ANGUS CARROLL SIGNS WITH APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC welcomes Australian Featherweight Angus Carroll to the promotion, representing Anytime Fitness Willoughby.',
    artLabel: 'NEW SIGNING.',
    artSubline: 'ANGUS CARROLL · FEATHERWEIGHT',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship is pleased to announce the signing of Angus Carroll to the AFC roster. The Australian competitor joins the promotion as a Featherweight, adding a new name to the division.',
          'Carroll represents Australia and fights out of Anytime Fitness Willoughby. His signing is now reflected across the official AFC fighter directory and division listings.'
        ]
      },
      {
        heading: 'A NEW FEATHERWEIGHT JOINS THE ROSTER',
        paragraphs: [
          'Carroll becomes the latest addition to the AFC Featherweight division, joining the promotion’s growing roster of competitors. His official fighter profile includes his Australian representation and training base at Anytime Fitness Willoughby.',
          'AFC welcomes Angus Carroll to the organisation and looks forward to following his progress. No bout or event appearance has been announced for Carroll at this time.'
        ]
      }
    ],
    details: [
      { label: 'Fighter', value: 'Angus Carroll' },
      { label: 'Status', value: 'Signed to AFC' },
      { label: 'Division', value: 'Featherweight' },
      { label: 'Country', value: 'Australia' },
      { label: 'Fights out of', value: 'Anytime Fitness Willoughby' }
    ]
  },
  {
    slug: 'welcome-to-fight-week-afc-fn2-campion-vs-barrett',
    category: 'AFC NEWS · FIGHT WEEK SPECIAL',
    date: '9 NOVEMBER 2026',
    title: 'WELCOME TO FIGHT WEEK: AFC FN2 – CAMPION VS BARRETT',
    deck: 'Four bouts. Three championships. Seven fighters. One massive night.',
    artLabel: 'FIGHT WEEK.',
    artSubline: 'CAMPION VS BARRETT · 14 NOVEMBER 2026',
    sections: [
      {
        paragraphs: [
          'The wait is almost over. Appian Fighting Championship officially enters Fight Week ahead of its second major event, AFC Fight Night 2: Campion vs Barrett, taking place on Saturday 14 November 2026 at Silkstone Park, Breakfast Point.',
          'Following the inaugural AFC Fight Night on 19 September, the promotion returns with a four-bout fight card featuring three championship contests across the Featherweight, Welterweight and Flyweight divisions.',
          'Seven fighters will take to the competition area, representing five countries and several training facilities. With returning competitors looking to build on their previous performances and new faces looking to make an immediate impact, there is plenty at stake.',
          'From the updated opening contest between Markus Goldschmitt and Constantine Papadopolus to the Featherweight Championship main event, the night promises another major chapter in AFC history.'
        ]
      },
      {
        heading: 'BOUT 1: GOLDSCHMITT VS PAPADOPOULUS',
        paragraphs: [
          'WELTERWEIGHT DIVISION | OPENING BOUT',
          'The opening contest of AFC Fight Night 2 will see Markus Goldschmitt face Constantine Papadopolus in a Welterweight matchup after Goldschmitt was confirmed as the replacement for Angus McCall.',
          'Goldschmitt represents Australia and fights out of Anytime Fitness Chatswood. He now has the opportunity to make his AFC debut as the event’s opening competitor.',
          'Standing opposite him is Papadopolus, representing Greece and fighting out of Elevate Training Concord. Papadopolus has one of the busiest schedules on the card, with two appearances scheduled for Fight Night 2.',
          'His opening assignment against Goldschmitt will be an important first challenge before he returns later in the evening to challenge Felix Farah for the Welterweight Championship.',
          'For Goldschmitt, this is an opportunity to make his first appearance on the AFC stage. For Papadopolus, it is the beginning of a potentially defining night.'
        ]
      },
      {
        heading: 'BOUT 2: MATHER VS CAPOLUPO',
        paragraphs: [
          'FLYWEIGHT CHAMPIONSHIP',
          'The second contest will see Rohan Mather and Adrian Capolupo compete for the inaugural AFC Flyweight Championship.',
          'Mather, representing Ireland and Inner Westside Jiu Jitsu, returns following his appearance in the inaugural Fight Night. He reached the final at FN1 after defeating Capolupo in a closely contested semifinal by a 1–0 decision, before losing to Felix Farah in the championship final.',
          'Now competing at Flyweight, Mather has another opportunity to make AFC history and claim a championship of his own.',
          'Capolupo, representing Italy and Summer Hill Gym, will be determined to turn the tables after their previous meeting. With a record of 3–2, he brings valuable AFC experience into the contest.',
          'Only one fighter will leave as the first-ever AFC Flyweight Champion.'
        ]
      },
      {
        heading: 'CO-MAIN EVENT: FARAH VS PAPADOPOULOS',
        paragraphs: [
          'WELTERWEIGHT CHAMPIONSHIP',
          'The co-main event features reigning Welterweight Champion Felix Farah defending his title against Constantine Papadopolus.',
          'Farah, representing Lebanon and Integrated Fitness Burwood, made history at AFC Fight Night 1 by defeating Rohan Mather via submission in the final to become the inaugural AFC Welterweight Champion.',
          'With an official record of 4–1, Farah now faces his first title defence. He will be looking to prove that his position at the top of the division is no coincidence.',
          'However, Papadopolus will be aiming to spoil the champion’s plans. After opening his night against Markus Goldschmitt, he will return for a second contest with the Welterweight Championship on the line.',
          'A demanding double appearance awaits Papadopolus, while Farah has one clear objective: retain his championship.'
        ]
      },
      {
        heading: 'MAIN EVENT: BARRETT VS CAMPION',
        paragraphs: [
          'FEATHERWEIGHT CHAMPIONSHIP',
          'The main event of AFC Fight Night 2 will see Byron Barrett face Jack Campion for the inaugural AFC Featherweight Championship.',
          'Barrett, representing Australia and Inner Westside Jiu Jitsu, makes his AFC debut on the biggest possible stage: a championship main event.',
          'Standing in his way is Jack Campion, representing Australia and Summer Hill Gym. With an official AFC record of 1–2–1, Campion returns looking to add another significant result to his record.',
          'Campion normally competes at Flyweight but will step up to Featherweight for this championship opportunity.',
          'For Barrett, it is a chance to make an immediate statement in his first AFC appearance. For Campion, it is an opportunity to become a champion and add another milestone to his AFC career.',
          'One contest. One championship. One inaugural Featherweight Champion.'
        ]
      },
      {
        heading: 'THREE CHAMPIONSHIPS. THREE STORIES.',
        paragraphs: [
          'AFC Fight Night 2 will feature three championship contests:',
          'Flyweight Championship: Rohan Mather vs Adrian Capolupo',
          'Welterweight Championship: Felix Farah vs Constantine Papadopolus',
          'Featherweight Championship: Byron Barrett vs Jack Campion',
          'The Welterweight Championship is already held by Felix Farah. The Flyweight and Featherweight divisions will each crown their first-ever AFC champion.'
        ]
      },
      {
        heading: 'THE VENUE',
        paragraphs: [
          'AFC Fight Night 2 will take place at Silkstone Park, Breakfast Point, with fighters scheduled to make their entrances through the park’s fountains and garden path.',
          'The setting will provide a unique atmosphere for the promotion’s second event, as competitors make their way towards the competition area.',
          'Event date: Saturday 14 November 2026',
          'Venue: Silkstone Park, Breakfast Point',
          'Start time: 5:30 PM',
          'Fight card: Four bouts, three championship contests'
        ]
      },
      {
        heading: 'THE COUNTDOWN IS ON',
        paragraphs: [
          'The fighters are preparing. The championships are on the line. The stage is set.',
          'From Goldschmitt vs Papadopolus to the highly anticipated Campion vs Barrett main event, AFC Fight Night 2 promises an unforgettable night for the promotion.',
          'Saturday 14 November. Silkstone Park. AFC Fight Night 2.',
          'WELCOME TO FIGHT WEEK.'
        ]
      }
    ],
    details: [
      { label: 'Event', value: 'AFC Fight Night 2: Campion vs Barrett' },
      { label: 'Date', value: 'Saturday 14 November 2026' },
      { label: 'Venue', value: 'Silkstone Park, Breakfast Point' },
      { label: 'Scheduled bouts', value: '4' },
      { label: 'Championship contests', value: '3' },
      { label: 'Competitors', value: '7' },
      { label: 'Event start', value: '5:30 PM' }
    ]
  },
  {
    slug: 'felix-farah-welterweight-champion',
    category: 'CHAMPIONSHIP ANNOUNCEMENT',
    date: '8 NOVEMBER 2026',
    title: 'FELIX FARAH CROWNED INAUGURAL AFC WELTERWEIGHT CHAMPION',
    deck: 'Felix Farah claimed the inaugural AFC championship at Fight Night 1, earning recognition as the promotion’s first Welterweight Champion after winning the final by submission.',
    artLabel: 'WELTERWEIGHT CHAMPION.',
    artSubline: 'FELIX FARAH · INAUGURAL CHAMPION',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship confirms Felix Farah as the inaugural AFC Welterweight Champion following his championship-winning performance at AFC Fight Night 1 on 19 September 2026.',
          'Farah secured the title by defeating Rohan Mather by submission in the Fight Night 1 final at Appian Arena, bringing the inaugural event to a close as champion.'
        ]
      },
      {
        heading: 'A CHAMPIONSHIP-WINNING NIGHT',
        paragraphs: [
          'Farah advanced through the inaugural Fight Night 1 competition before facing Mather in the final. He went on to win by submission, earning the first AFC championship.',
          'With Farah registered in the Welterweight division, the organisation recognises him as its inaugural Welterweight Champion.'
        ]
      },
      {
        heading: 'THE FIRST NAME ON THE WELTERWEIGHT HONOUR ROLL',
        paragraphs: [
          'The title establishes Farah as the first champion in AFC Welterweight history. His championship victory is now part of the official record of the promotion’s inaugural event.',
          'AFC congratulates Felix Farah on becoming the inaugural Welterweight Champion.'
        ]
      }
    ],
    details: [
      { label: 'Champion', value: 'Felix Farah' },
      { label: 'Division', value: 'Welterweight' },
      { label: 'Event', value: 'AFC Fight Night 1' },
      { label: 'Date', value: '19 September 2026' },
      { label: 'Final opponent', value: 'Rohan Mather' },
      { label: 'Official result', value: 'Felix Farah won by submission' },
      { label: 'Championship status', value: 'Inaugural AFC Welterweight Champion' }
    ]
  },
  {
    slug: 'fight-night-3-weight-class-system-explained',
    category: 'OFFICIAL FORMAT EXPLAINER',
    date: '3 NOVEMBER 2026',
    title: 'AFC CONFIRMS HOW THE NEW WEIGHT CLASS SYSTEM WILL WORK AT FIGHT NIGHT 3',
    deck: 'AFC Fight Night 3 will feature at least two divisions: Flyweight and Lightweight. The Fight Night 2 champion will carry their title into the relevant division, while the other division begins with a vacant championship.',
    artLabel: 'WEIGHT CLASSES.',
    artSubline: 'FLYWEIGHT · LIGHTWEIGHT',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has provided further details on the introduction of weight classes, which will take effect at AFC Fight Night 3.',
          'At least two weight classes will feature at Fight Night 3: Flyweight and Lightweight. The change will establish separate championship paths for competitors in each division.'
        ]
      },
      {
        heading: 'HOW THE CHAMPIONSHIPS WILL BE AWARDED',
        paragraphs: [
          'The champion at the conclusion of AFC Fight Night 2 will become the champion of the weight class they are assigned to. The championship in the other weight class will begin vacant.',
          'This means one division will enter Fight Night 3 with its inaugural champion already determined through the conclusion of Fight Night 2, while the other division will have a vacant belt.'
        ]
      },
      {
        heading: 'CONFIRMED WEIGHT CLASS ASSIGNMENTS',
        paragraphs: [
          'The initial assignments for the announced competitors are Jack Campion and Adrian Capolupo in Flyweight, and Rohan Mather and Felix Farah in Lightweight.',
          'These are the confirmed assignments announced so far. Further changes and additional information about the weight-class system will be announced soon.'
        ]
      },
      {
        heading: 'MORE DETAILS TO COME',
        paragraphs: [
          'AFC has confirmed that at least two weight classes will be in place for Fight Night 3. Further changes to the divisions and the wider competition format will be communicated as they are announced.'
        ]
      }
    ],
    details: [
      { label: 'Event taking effect', value: 'AFC Fight Night 3' },
      { label: 'Event date', value: 'Saturday 5 December 2026' },
      { label: 'Confirmed divisions', value: 'Flyweight and Lightweight' },
      { label: 'Flyweight', value: 'Jack Campion, Adrian Capolupo' },
      { label: 'Lightweight', value: 'Rohan Mather, Felix Farah' },
      { label: 'Fight Night 2 champion', value: 'Becomes champion of their assigned weight class' },
      { label: 'Other weight-class championship', value: 'Vacant' },
      { label: 'Further changes', value: 'To be announced soon' }
    ]
  },
  {
    slug: 'fight-night-3-byron-barrett-signing',
    category: 'OFFICIAL SIGNING ANNOUNCEMENT',
    date: '3 NOVEMBER 2026',
    title: 'BYRON BARRETT SIGNS WITH APPIAN FIGHTING CHAMPIONSHIP',
    deck: 'AFC has announced the signing of Byron Barrett. His first appearance for the promotion is scheduled for AFC Fight Night 3, which will introduce weight classes.',
    artLabel: 'BYRON BARRETT.',
    artSubline: 'SIGNED · FIGHT NIGHT 03 DEBUT',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has officially announced the signing of Byron Barrett, who joins the promotion’s roster ahead of the next chapter in the AFC Fight Nights series.',
          'Barrett is set to make his first appearance for AFC at Fight Night 3. The event will introduce weight classes, marking a change to the competition format.'
        ]
      },
      {
        heading: 'FIRST APPEARANCE AT FIGHT NIGHT 3',
        paragraphs: [
          'AFC Fight Night 3 will mark Byron Barrett’s debut appearance for the promotion. His signing adds a new competitor to the AFC roster as the organisation prepares to introduce weight classes.',
          'The specific weight divisions, weight limits and competitor allocations for Fight Night 3 have not yet been announced.'
        ]
      },
      {
        heading: 'A NEW CHAPTER FOR AFC',
        paragraphs: [
          'Fight Night 3 will also move away from the round-robin format used at the inaugural AFC Fight Night 1. Further details about the event structure and Barrett’s participation will be announced when confirmed.'
        ]
      }
    ],
    details: [
      { label: 'Promotion', value: 'Appian Fighting Championship (AFC)' },
      { label: 'New signing', value: 'Byron Barrett' },
      { label: 'First appearance', value: 'AFC Fight Night 3' },
      { label: 'Event date', value: 'Saturday 5 December 2026' },
      { label: 'Competition format', value: 'Weight classes introduced' },
      { label: 'Weight division', value: 'To be announced' },
      { label: 'Fight Night 3 details', value: 'Further information to come' }
    ]
  },
  {
    slug: 'fight-night-3-format-announced',
    category: 'OFFICIAL FORMAT ANNOUNCEMENT',
    date: '3 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 3 TO INTRODUCE WEIGHT CLASSES AS ROUND-ROBIN FORMAT IS DROPPED',
    deck: 'AFC Fight Night 3 will introduce weight classes, marking a change to the promotion’s competition format. The round-robin system used at Fight Night 1 will be removed.',
    artLabel: 'FIGHT NIGHT 03.',
    artSubline: 'NEW FORMAT · WEIGHT CLASSES',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has announced that AFC Fight Night 3 will feature weight classes, introducing a new structure for competitors at the event.',
          'The change also means the round-robin format will be removed. AFC used the round-robin system at its inaugural Fight Night 1, but it will not return for Fight Night 3.'
        ]
      },
      {
        heading: 'WEIGHT CLASSES INTRODUCED',
        paragraphs: [
          'Competitors at AFC Fight Night 3 will be organised into weight classes. The specific divisions, weight limits and competitor allocations have not yet been announced.',
          'Further details about how the weight classes will be structured will be released by AFC when confirmed.'
        ]
      },
      {
        heading: 'ROUND-ROBIN FORMAT REMOVED',
        paragraphs: [
          'The round-robin format will no longer be used for Fight Night 3. The event will move away from the system in which competitors faced multiple opponents in a shared pool.',
          'AFC will announce further details of the Fight Night 3 format as they are confirmed.'
        ]
      }
    ],
    details: [
      { label: 'Promotion', value: 'Appian Fighting Championship (AFC)' },
      { label: 'Event', value: 'AFC Fight Night 3' },
      { label: 'Event date', value: 'Saturday 5 December 2026' },
      { label: 'Weight classes', value: 'Introduced' },
      { label: 'Round-robin format', value: 'Removed' },
      { label: 'Specific divisions and limits', value: 'To be announced' },
      { label: 'Event format details', value: 'Further information to come' }
    ]
  },
  {
    slug: 'the-entrance-beach-fight-night-confirmed',
    category: 'OFFICIAL EVENT ANNOUNCEMENT',
    date: '1 NOVEMBER 2026',
    title: 'CENTRAL COAST COUNCIL CONFIRMS AFC FIGHT NIGHT AT THE ENTRANCE BEACH',
    deck: 'Central Coast Council has confirmed an AFC Fight Night will take place at The Entrance Beach during the first two weeks of December 2026.',
    artLabel: 'THE ENTRANCE',
    artSubline: 'BEACH FIGHT NIGHT · DECEMBER 2026',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has received confirmation from Central Coast Council that an AFC Fight Night will take place at The Entrance Beach during the first two weeks of December 2026.',
          'The event will bring the AFC Fight Nights series to The Entrance, with the beach confirmed as the location for the planned December event.'
        ]
      },
      {
        heading: 'DECEMBER EVENT CONFIRMED',
        paragraphs: [
          'The confirmed event window is the first two weeks of December 2026. An exact date and event time have not yet been announced.',
          'Further details, including the fight card and individual matchups, will be released by AFC when confirmed.'
        ]
      },
      {
        heading: 'EVENT DETAILS',
        paragraphs: [
          'AFC will provide additional information about the event as arrangements are finalised.'
        ]
      }
    ],
    details: [
      { label: 'Promotion', value: 'Appian Fighting Championship (AFC)' },
      { label: 'Confirmation', value: 'Central Coast Council' },
      { label: 'Event', value: 'AFC Fight Night' },
      { label: 'Location', value: 'The Entrance Beach, NSW' },
      { label: 'Date window', value: 'First two weeks of December 2026' },
      { label: 'Exact date and time', value: 'To be announced' },
      { label: 'Fight card and matchups', value: 'To be announced' }
    ]
  },
  {
    slug: 'eungai-creek-exclusive-hosting-agreement',
    category: 'OFFICIAL PARTNERSHIP ANNOUNCEMENT',
    date: '16 OCTOBER 2026',
    title: 'AFC SIGNS EXCLUSIVE HOSTING AGREEMENT WITH EUNGAI CREEK FIGHT CLUB',
    deck: 'The agreement secures Eungai Creek Fight Club as the exclusive host venue partner for at least three AFC Fight Nights during a planned eight-week programme spanning 27 January to 20 March 2027.',
    artLabel: 'EUNGAI CREEK',
    artSubline: 'EXCLUSIVE HOSTING PARTNER',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has signed an exclusive hosting agreement with Eungai Creek Fight Club, establishing the club as the exclusive host for a new run of AFC Fight Nights in early 2027.',
          'Under the agreement, Eungai Creek Fight Club will host at least three AFC Fight Nights across a planned eight-week programme, with the hosting period running between 27 January and 20 March 2027.',
          'The agreement marks a new step for AFC as the promotion plans a series of events in partnership with the club. The exclusive arrangement covers the hosting of the agreed Fight Nights during this programme.'
        ]
      },
      {
        heading: 'AT LEAST THREE FIGHT NIGHTS',
        paragraphs: [
          'A minimum of three Fight Nights are included in the agreement. Individual event dates, fight cards, matchups and event times have not yet been announced.',
          'AFC will publish further information as each event is confirmed. The programme is intended to bring multiple nights of AFC competition to Eungai Creek Fight Club within the agreed period.'
        ]
      },
      {
        heading: 'AGREEMENT DETAILS',
        paragraphs: [
          'The agreement establishes an exclusive hosting partnership between Appian Fighting Championship and Eungai Creek Fight Club for the planned programme.'
        ]
      }
    ],
    details: [
      { label: 'Promotion', value: 'Appian Fighting Championship (AFC)' },
      { label: 'Hosting partner', value: 'Eungai Creek Fight Club' },
      { label: 'Agreement', value: 'Exclusive hosting agreement' },
      { label: 'Minimum events', value: 'At least three AFC Fight Nights' },
      { label: 'Programme', value: 'Eight-week hosting programme' },
      { label: 'Date window', value: '27 January – 20 March 2027' },
      { label: 'Individual event dates', value: 'To be announced' },
      { label: 'Fight cards and matchups', value: 'To be announced' }
    ]
  },
  {
    slug: 'fight-night-2-announced',
    category: 'OFFICIAL FIGHT CARD ANNOUNCEMENT · UPDATED',
    date: '7 NOVEMBER 2026',
    title: 'AFC FIGHT NIGHT 2: CAMPION VS BARRETT',
    deck: 'AFC Fight Night 2 is set for Saturday 14 November at Silkstone Park, Breakfast Point, featuring four bouts and three championship contests.',
    artLabel: 'AFC FIGHT NIGHT 2.',
    artSubline: 'CAMPION VS BARRETT · THREE TITLE FIGHTS',
    sections: [
      {
        paragraphs: [
          'Appian Fighting Championship (AFC) has officially announced AFC Fight Night 2, scheduled for Saturday 14 November 2026 at Silkstone Park in Breakfast Point.',
          'The official Fight Night 2 card features four bouts, with three championship contests across Featherweight, Welterweight and Flyweight.'
        ]
      },
      {
        heading: 'THE WALKOUT THROUGH SILKSTONE PARK',
        paragraphs: [
          'The fighter walkouts will take a route through Silkstone Park’s famous fountains and along its garden path, making the park itself part of the Fight Night 2 entrance.',
          'Silkstone Park is located in Breakfast Point, where the event will take place on Saturday 14 November.'
        ]
      },
      {
        heading: 'THE OFFICIAL FIGHT ORDER',
        paragraphs: [
          'Main Event — Featherweight Title: Byron Barrett vs Jack Campion.',
          'Co-Main Event — Welterweight Title: Felix Farah vs Constantine Papadopolus.',
          'Flyweight Title: Rohan Mather vs Adrian Capolupo.',
          'Welterweight: Markus Goldschmitt vs Constantine Papadopolus.'
        ]
      },
      {
        heading: 'THREE TITLE FIGHTS',
        paragraphs: [
          'Three championships will be contested on one card: Featherweight, Welterweight and Flyweight.',
          'The event is scheduled to begin at 5:30 PM. The fight order above is the official order published by AFC.'
        ]
      }
    ],
    details: [
      { label: 'Promotion', value: 'Appian Fighting Championship (AFC)' },
      { label: 'Event', value: 'AFC Fight Night 2' },
      { label: 'Date', value: 'Saturday 14 November 2026' },
      { label: 'Location', value: 'Silkstone Park, Breakfast Point' },
      { label: 'Main event', value: 'Byron Barrett vs Jack Campion — Featherweight Title' },
      { label: 'Co-main event', value: 'Felix Farah vs Constantine Papadopolus — Welterweight Title' },
      { label: 'Flyweight title', value: 'Rohan Mather vs Adrian Capolupo' },
      { label: 'Welterweight bout', value: 'Markus Goldschmitt vs Constantine Papadopolus' },
      { label: 'Championships', value: 'Three title fights' },
      { label: 'Fight order', value: 'Four confirmed bouts' },
      { label: 'Event time', value: '5:30 PM' }
    ]
  }
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const href = (path: string) => `#/${path}`;
function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.replace(/^#\/?/, '') || 'home'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const update = () => {
      setRoute(window.location.hash.replace(/^#\/?/, '') || 'home');
      setMenuOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const go = (path: string) => {
    window.location.hash = `/${path}`;
    setMenuOpen(false);
  };
  const nav = [
    { label: 'Home', path: 'home' },
    { label: 'Events', path: 'events' },
    { label: 'Tickets', path: 'tickets' },
    { label: 'Fighters', path: 'fighters' },
    { label: 'Divisions', path: 'divisions' },
    { label: 'Rankings', path: 'rankings' },
    { label: 'News', path: 'news' },
    { label: 'About', path: 'about' },
  ];
  const fighterRoute = route.startsWith('fighter/')
    ? (route.split('/')[1] as FighterId)
    : null;
  const currentFighter =
    fighterRoute && fighters[fighterRoute] ? fighterRoute : null;
  const title = currentFighter
    ? fighters[currentFighter].name      : route === 'event/fight-night-1'
      ? 'AFC Fight Night 1'
      : route === 'event/fight-night-2'
        ? 'AFC Fight Night 2'
        : route === 'event/fight-night-3'
          ? 'AFC Fight Night 3'
          : route.startsWith('news/')
          ? 'AFC News Story'
          : route.charAt(0).toUpperCase() + route.slice(1);
  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href={href('home')} aria-label="AFC home">
          <span className="brand-mark">AFC</span>
          <span className="brand-caption">
            APPIAN FIGHTING
            <br />
            CHAMPIONSHIP
          </span>
        </a>
        <nav className="desktop-nav">
          {nav.map(n => (
            <a
              key={n.path}
              className={route === n.path ? 'active' : ''}
              href={href(n.path)}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      {menuOpen && (
        <nav className="mobile-nav">
          {nav.map(n => (
            <a key={n.path} href={href(n.path)}>
              {n.label}
              <ArrowRight size={16} />
            </a>
          ))}
        </nav>
      )}
      <main>
        {route === 'home' && <Home go={go} />}
        {route === 'events' && <Events go={go} />
        }{route === 'tickets' && <Tickets />}
        {route === 'tickets/fight-night-3' && <Tickets initialEventSlug="fight-night-3" />}
        {route === 'event/fight-night-1' && <EventDetail go={go} />}
        {route === 'event/fight-night-2' && <FightNightTwoDetail go={go} />}
        {route === 'event/fight-night-3' && <FightNightThreeDetail go={go} />}
        {route === 'fighters' && (
          <Fighters go={go} query={query} setQuery={setQuery} />
        )}
        {currentFighter && <FighterProfile id={currentFighter} go={go} />}
        {route === 'rankings' && <Rankings go={go} />}
        {route === 'divisions' && <Divisions go={go} />}
        {route === 'news' && <News go={go} />}
        {route.startsWith('news/') && newsStories.some(story => story.slug === route.slice(5)) && (
          <NewsStory story={newsStories.find(story => story.slug === route.slice(5))!} go={go} />
        )}
        {route === 'about' && <About go={go} />}
        {![
          'home',
          'events',
          'tickets',
          'tickets/fight-night-3',
          'event/fight-night-1',
          'event/fight-night-2',
          'event/fight-night-3',
          'fighters',
          'divisions',
          'rankings',
          'news',
          'about',
        ].includes(route) &&
          !currentFighter &&
          !(route.startsWith('news/') && newsStories.some(story => story.slug === route.slice(5))) &&
          <NotFound go={go} />}
      </main>
      <Footer go={go} />
    </div>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function PageIntro({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-intro wrap">
      <Eyebrow>{kicker}</Eyebrow>
      <h1>{title}</h1>
      <p>{copy}</p>
    </section>
  );
}
function FighterLink({
  id,
  go,
  compact = false,
}: {
  id: FighterId;
  go: (s: string) => void;
  compact?: boolean;
}) {
  return (
    <button
      className={compact ? 'fighter-link compact' : 'fighter-link'}
      onClick={() => go(`fighter/${id}`)}
    >
      <span className="avatar">{fighters[id].initials}</span>
      <span>{fighters[id].name}</span>
      <ArrowRight size={15} />
    </button>
  );
}
function RecordPill({ id }: { id: FighterId }) {
  return <span className="record-pill">{recordText(id)}</span>;
}
function ResultCard({ fight, go }: { fight: Fight; go: (s: string) => void }) {
  const aWon = fight.winner === fight.a;
  const bWon = fight.winner === fight.b;
  return (
    <article className="result-card">
      <div className="result-top">
        <span>
          {fight.stage}
          {fight.number ? ` · Bout ${fight.number}` : ''}
        </span>
        <span
          className={
            fight.method === 'No Contest'
              ? 'tag tag-muted'
              : fight.method === 'Disqualification'
                ? 'tag tag-red'
                : 'tag'
          }
        >
          {fight.method === 'No Contest'
            ? 'NC'
            : fight.method === 'Disqualification'
              ? 'DQ'
              : fight.method.toUpperCase()}
        </span>
      </div>
      <div className="versus-row">
        <button
          className={aWon ? 'fighter-side winner' : 'fighter-side'}
          onClick={() => go(`fighter/${fight.a}`)}
        >
          <span className="mini-avatar">{fighters[fight.a].initials}</span>
          <span>{fighters[fight.a].name}</span>
          {aWon && <b>W</b>}
        </button>
        <span className="versus">VS</span>
        <button
          className={bWon ? 'fighter-side winner' : 'fighter-side'}
          onClick={() => go(`fighter/${fight.b}`)}
        >
          <span className="mini-avatar">{fighters[fight.b].initials}</span>
          <span>{fighters[fight.b].name}</span>
          {bWon && <b>W</b>}
        </button>
      </div>
      <div className="result-bottom">
        <strong>
          {fight.method === 'No Contest'
            ? 'NO CONTEST'
            : `${fighters[fight.winner as FighterId].name} WINS`}
        </strong>
        <span>
          {fight.method}
          {fight.score ? ` · ${fight.score}` : ''}
          {fight.reason ? ` · ${fight.reason}` : ''}
        </span>
      </div>
    </article>
  );
}
function ChampionBanner({ go }: { go: (s: string) => void }) {
  const champions: { id: FighterId; division: string; event: string }[] = [
    { id: 'adrian', division: 'FLYWEIGHT CHAMPION', event: 'CROWNED · FIGHT NIGHT 2' },
    { id: 'jack', division: 'FEATHERWEIGHT CHAMPION', event: 'CROWNED · FIGHT NIGHT 2' },
    { id: 'felix', division: 'WELTERWEIGHT CHAMPION', event: 'CROWNED · FIGHT NIGHT 1' },
  ];

  return (
    <section className="champion-banner">
      <div className="champion-watermark">03</div>
      <div className="champion-copy">
        <Eyebrow>THE CHAMPIONS</Eyebrow>
        <h2>THREE DIVISIONS. <em>THREE CHAMPIONS.</em></h2>
        <div className="home-champion-grid">
          {champions.map(champion => (
            <button
              className="home-champion-card"
              key={champion.id}
              onClick={() => go(`fighter/${champion.id}`)}
            >
              <span>{champion.division}</span>
              <b>{fighters[champion.id].name}</b>
              <small>{champion.event}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="champion-seal">
        <span>AFC</span>
        <Trophy size={42} />
        <small>THREE DIVISION<br />CHAMPIONS</small>
      </div>
    </section>
  );
}
function Home({ go }: { go: (s: string) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-content wrap">
          <Eyebrow>INDEPENDENT GRAPPLING PROMOTION</Eyebrow>
          <h1>
            BUILT THROUGH
            <br />
            <span>COMPETITION.</span>
          </h1>
          <p>Independent grappling. Real rivalries. One championship.</p>
          <div className="hero-actions">
            <button className="button button-red" onClick={() => go('events')}>
              EXPLORE FIGHT HISTORY <ArrowRight size={17} />
            </button>
            <button
              className="button button-outline"
              onClick={() => go('fighters')}
            >
              MEET THE FIGHTERS
            </button>
          </div>
          <div className="hero-foot">
            <span>SYDNEY · AUSTRALIA</span>
            <span>EST. 2026</span>
          </div>
        </div>
        <div className="hero-vertical">APPIAN FIGHTING CHAMPIONSHIP</div>
      </section>
      <button
        className="breaking-news-strip"
        onClick={() => go('news/lachlan-cole-signs-with-afc')}
        aria-label="Read news: Lachlan Cole signs with AFC"
      >
        <span className="breaking-news-label">NEW SIGNING</span>
        <span className="breaking-news-headline">LACHLAN COLE SIGNS WITH AFC</span>
        <span className="breaking-news-action">READ STORY <ArrowRight size={16} /></span>
      </button>
      <section className="intro-strip wrap">
        <div>
          <Eyebrow>THE AFC STANDARD</Eyebrow>
          <h2>
            EVERY MATCHUP
            <br />
            WRITES THE STORY.
          </h2>
        </div>
        <p>
          Appian Fighting Championship brings together a dedicated roster of
          competitors for structured grappling contests built around technical
          ability, determination and competitive ambition. Every matchup
          contributes to the history of the promotion.
        </p>
      </section>
      <section className="feature-event">
        <div className="feature-event-inner wrap">
          <div>
            <Eyebrow>THE ARCHIVE · 002</Eyebrow>
            <h2>
              AFC FIGHT
              <br />
              <span>NIGHT 2</span>
            </h2>
            <p className="muted">
              Four official results. Three championship contests. A new chapter in AFC history.
            </p>
            <div className="event-meta">
              <span>
                <b>14 NOV</b> 2026
              </span>
              <span>
                <b>VENUE</b> Silkstone Park
              </span>
              <span>
                <b>RESULTS</b> 4 bouts completed
              </span>
            </div>
            <button
              className="button button-red"
              onClick={() => go('event/fight-night-2')}
            >
              VIEW OFFICIAL RESULTS <ArrowRight size={16} />
            </button>
          </div>
          <div className="event-art">
            <div className="event-art-ring">AFC</div>
            <div className="event-art-text">
              FIGHT NIGHT
              <br />
              <b>02</b>
            </div>
            <span>14.11.2026 / SILKSTONE PARK</span>
          </div>
        </div>
      </section>
      <div className="wrap section-space">
        <ChampionBanner go={go} />
      </div>
      <section className="wrap section-space">
        <SectionHeading
          kicker="THE ROSTER"
          title="13 FIGHTERS. ONE HISTORY."
          action="VIEW ALL FIGHTERS"
          onAction={() => go('fighters')}
        />
        <div className="fighter-grid">
          {(Object.keys(fighters) as FighterId[]).map(id => (
            <FighterCard key={id} id={id} go={go} />
          ))}
        </div>
      </section>
      <section className="dark-section section-space">
        <div className="wrap">
          <SectionHeading
            kicker="OFFICIAL RECORD"
            title="THE RESULTS SPEAK."
            action="FULL EVENT ARCHIVE"
            onAction={() => go('event/fight-night-1')}
          />
          <div className="result-grid">
            {['final', 'semi', 'rr4', 'rr5'].map(id => (
              <ResultCard
                key={id}
                fight={fights.find(f => f.id === id)!}
                go={go}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="wrap news-empty-home">
        <div>
          <Eyebrow>NEXT EVENT · 003</Eyebrow>
          <h2>
            FIGHT NIGHT
            <br />
            THREE.
          </h2>
        </div>
        <div>
          <p><strong>AFC Fight Night 3: Mather vs Carroll takes place Saturday 5 December 2026 at Yerroulbin Reserve, Birchgrove.</strong></p>
          <p>Four bouts are confirmed, led by Rohan Mather vs Angus Carroll for the Interim Lightweight Championship. Markus Goldschmitt is scheduled for both the opening and co-main bouts. Event start time is to be announced.</p>
          <button className="text-link" onClick={() => go('event/fight-night-3')}>VIEW FIGHT NIGHT 3 <ArrowRight size={16} /></button>
          <button className="text-link" onClick={() => go('tickets/fight-night-3')}>RESERVE FREE TICKETS <ArrowRight size={16} /></button>
        </div>
      </section>
    </>
  );
}
function SectionHeading({
  kicker,
  title,
  action,
  onAction,
}: {
  kicker: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{kicker}</Eyebrow>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-link" onClick={onAction}>
          {action} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
function FighterCard({ id, go }: { id: FighterId; go: (s: string) => void }) {
  return (
    <button className="fighter-card" onClick={() => go(`fighter/${id}`)}>
      <div className="fighter-card-art">
        <span>{fighters[id].initials}</span>
        <small>AFC / 2026</small>
        {id === 'felix' && <b>CHAMPION</b>}
      </div>
      <div className="fighter-card-info">
        <div>
          <h3>{fighters[id].name}</h3>
          <p>{fighterDivisions[id] || 'Weight class TBA'}</p>
        </div>
        <RecordPill id={id} />
      </div>
    </button>
  );
}
function Events({ go }: { go: (s: string) => void }) {
  return (
    <>
      <PageIntro kicker="EVENT ARCHIVE" title="THE FIGHT HISTORY." copy="Every completed event. Every official result. The record of Appian Fighting Championship." />
      <section className="wrap archive-list">
        <SectionHeading kicker="UP NEXT" title="UPCOMING EVENT." />
        <button className="event-archive-card upcoming-event-card" onClick={() => go('event/fight-night-3')}>
          <div className="archive-art"><span>AFC</span><b>03</b><small>FIGHT NIGHT</small></div>
          <div className="archive-details"><div className="archive-top"><span className="status-dot">ANNOUNCED</span><span>5 DECEMBER 2026</span></div><h2>AFC FIGHT NIGHT 3: MATHER VS CARROLL</h2><p>Yerroulbin Reserve · Birchgrove · Interim Lightweight Championship main event.</p><div className="archive-bottom"><span>4 BOUTS CONFIRMED · FREE ADMISSION</span><span className="arrow-circle"><ArrowRight /></span></div></div>
        </button>
        <div className="archive-ticket-link"><span>ATTENDING FIGHT NIGHT 3?</span><button className="text-link" onClick={() => go('tickets/fight-night-3')}>BOOK FREE TICKETS <ArrowRight size={16} /></button></div>
        <SectionHeading kicker="OFFICIAL EVENT ARCHIVE" title="SELECT AN EVENT." />
        <p className="section-lead">Choose an archived AFC event to view its official fight card, results and championship history.</p>
        <div className="archive-event-selector">
          <button className="event-archive-card" onClick={() => go('event/fight-night-1')}><div className="archive-art"><span>AFC</span><b>01</b><small>FIGHT NIGHT</small></div><div className="archive-details"><div className="archive-top"><span className="status-dot">COMPLETED</span><span>19 SEPTEMBER 2026</span></div><h2>AFC FIGHT NIGHT 1</h2><p>Appian Arena · Five-fighter round robin followed by championship playoffs.</p><div className="archive-bottom"><span>10 ROUND-ROBIN BOUTS · 2 PLAYOFFS</span><span className="arrow-circle"><ArrowRight /></span></div></div></button>
          <button className="event-archive-card" onClick={() => go('event/fight-night-2')}><div className="archive-art"><span>AFC</span><b>02</b><small>FIGHT NIGHT</small></div><div className="archive-details"><div className="archive-top"><span className="status-dot">COMPLETED</span><span>14 NOVEMBER 2026</span></div><h2>AFC FIGHT NIGHT 2: CAMPION VS BARRETT</h2><p>Silkstone Park · Breakfast Point · Four bouts completed, including three championship contests.</p><div className="archive-bottom"><span>4 OFFICIAL RESULTS · 3 CHAMPIONS CROWNED</span><span className="arrow-circle"><ArrowRight /></span></div></div></button>
        </div>
      </section>
    </>
  );
}
function FightNightTwoDetail({ go }: { go: (s: string) => void }) {
  const card: FighterId[] = ['byron', 'jack', 'felix', 'constantine', 'rohan', 'adrian', 'markus'];

  return (
    <>
      <div className="event-detail-hero">
        <div className="wrap">
          <Eyebrow>OFFICIAL EVENT ARCHIVE · COMPLETED</Eyebrow>
          <div className="event-detail-title">
            <div>
              <h1>AFC FIGHT NIGHT 2<br /><span>CAMPION VS BARRETT.</span></h1>
              <p>APPIAN FIGHTING CHAMPIONSHIP</p>
            </div>
            <div className="event-date-block">
              <b>14</b>
              <span>NOVEMBER<br />2026</span>
            </div>
          </div>
          <div className="event-detail-meta">
            <span>VENUE <b>SILKSTONE PARK · BREAKFAST POINT</b></span>
            <span>STATUS <b>COMPLETED</b></span>
            <span>FIGHT CARD <b>04 BOUTS</b></span>
          </div>
        </div>
      </div>
      <section className="wrap section-space">
        <div className="profile-honour"><Trophy /><div><b>FIGHT NIGHT 2 · OFFICIAL RESULTS CONFIRMED</b><span>Saturday 14 November 2026 · All four bouts completed at Silkstone Park, Breakfast Point</span></div></div>
        <div className="fn2-title-callout"><span>THREE TITLE FIGHTS</span><strong>ONE NIGHT. THREE CHAMPIONSHIPS.</strong><p>Featherweight · Welterweight · Flyweight</p></div>
        <SectionHeading kicker="AFC FIGHT NIGHT 2: CAMPION VS BARRETT" title="OFFICIAL FIGHT ORDER." />
        <div className="profile-honour"><Trophy /><div><b>CONSTANTINE PAPADOPOPULUS WINS BY RETIREMENT</b><span>Official opening-bout result · AFC Fight Night 2</span></div></div>
        <p className="section-lead">All four bouts are complete. The three championship contests were scheduled for five rounds. Select any fighter to open their profile.</p>
        <div className="fn2-bout-list">
          {[
            { label: 'BOUT 01 · FINAL', title: 'FLYWEIGHT CHAMPIONSHIP · FIVE ROUNDS', a: 'rohan' as FighterId, b: 'adrian' as FighterId, oddsA: '+200 DOG', oddsB: '-250 FAV', result: 'ADRIAN CAPOLUPO WINS BY GUILLOTINE · ROUND 2' },
            { label: 'CO-MAIN EVENT · FINAL', title: 'WELTERWEIGHT CHAMPIONSHIP · FIVE ROUNDS', a: 'felix' as FighterId, b: 'constantine' as FighterId, oddsA: '-1000 FAV', oddsB: '+650 DOG', result: 'FELIX FARAH WINS BY REAR NAKED CHOKE · ROUND 2' },
            { label: 'MAIN EVENT · FINAL', title: 'FEATHERWEIGHT CHAMPIONSHIP · FIVE ROUNDS', a: 'jack' as FighterId, b: 'byron' as FighterId, oddsA: '-110 PICK’EM', oddsB: '-110 PICK’EM', result: 'JACK CAMPION WINS · 48–47 SPLIT DECISION' },
          ].map((bout, index) => (
            <article className={`fn2-bout-card ${index === 2 ? 'fn2-main-event' : ''}`} key={`${bout.label}-${bout.a}-${bout.b}`}>
              <div className="fn2-bout-meta"><span>{bout.label}</span><b>{bout.title}</b></div>
              <div className="fn2-bout-fighters">
                <button onClick={() => go(`fighter/${bout.a}`)}><span>{fighters[bout.a].initials}</span><strong>{fighters[bout.a].name}</strong></button>
                <em>VS</em>
                <button onClick={() => go(`fighter/${bout.b}`)}><span>{fighters[bout.b].initials}</span><strong>{fighters[bout.b].name}</strong></button>
              </div>
              <div className="fn2-bout-odds"><span>FINAL RESULT</span><b>{bout.result}</b><span>PRE-EVENT AFC ODDS</span><b>{fighters[bout.a].name} <strong>{bout.oddsA}</strong></b><b>{fighters[bout.b].name} <strong>{bout.oddsB}</strong></b></div>
            </article>
          ))}
        </div>
        <p className="fn2-time-note">Published AFC odds are retained as pre-event estimates, not a betting market. All three championship bouts were set for five rounds.</p>
        <SectionHeading kicker="THE FIGHTERS" title="FIGHT NIGHT 2 COMPETITORS." />
        <div className="fighter-grid">
          {card.map(id => <FighterCard key={id} id={id} go={go} />)}
        </div>
        <div className="standings-note">
          <Shield size={20} />
          <p><b>FIGHT NIGHT 2 · ALL RESULTS FINAL</b><br />Constantine Papadopolus won by retirement; Adrian Capolupo by guillotine in Round 2; Felix Farah by rear naked choke in Round 2; Jack Campion by 48–47 split decision.</p>
        </div>
        <dl className="news-event-details">
          <div><dt>Event</dt><dd>AFC Fight Night 2</dd></div>
          <div><dt>Date</dt><dd>Saturday 14 November 2026</dd></div>
          <div><dt>Location</dt><dd>Silkstone Park</dd></div>
          <div><dt>Event results</dt><dd>All four bouts completed</dd></div>
          <div><dt>Championship format</dt><dd>Five rounds for all three title bouts</dd></div>
          <div><dt>Event time</dt><dd>5:30 PM</dd></div>
        </dl>
        <button className="text-link back-link" onClick={() => go('events')}><ArrowLeft size={16} /> BACK TO EVENTS</button>
      </section>
    </>
  );
}

function FightNightThreeDetail({ go }: { go: (s: string) => void }) {
  const card: { label: string; title: string; a: FighterId; b: FighterId }[] = [
    { label: 'BOUT 01 · OPENING BOUT', title: 'OPENING BOUT', a: 'markus', b: 'constantine' },
    { label: 'BOUT 02 · FEATURED BOUT', title: 'FEATURED BOUT', a: 'julian', b: 'luca' },
    { label: 'BOUT 03 · CO-MAIN EVENT', title: 'CO-MAIN EVENT', a: 'angus', b: 'markus' },
    { label: 'BOUT 04 · MAIN EVENT', title: 'INTERIM FEATHERWEIGHT CHAMPIONSHIP', a: 'rohan', b: 'angus-carroll' },
  ];

  return (
    <>
      <div className="event-detail-hero">
        <div className="wrap">
          <Eyebrow>UPCOMING EVENT · FULL CARD CONFIRMED</Eyebrow>
          <div className="event-detail-title">
            <div>
              <h1>AFC FIGHT NIGHT 3<br /><span>MATHER VS CARROLL.</span></h1>
              <p>APPIAN FIGHTING CHAMPIONSHIP</p>
            </div>
            <div className="event-date-block">
              <b>28</b>
              <span>NOVEMBER<br />2026</span>
            </div>
          </div>
          <div className="event-detail-meta">
            <span>VENUE <b>YERROULBIN RESERVE · BIRCHGROVE</b></span>
            <span>STATUS <b>UPCOMING</b></span>
            <span>FIGHT CARD <b>04 BOUTS</b></span>
          </div>
        </div>
      </div>
      <section className="wrap section-space">
        <div className="ticket-callout">
          <div>
            <span className="ticket-kicker">FREE GENERAL ADMISSION</span>
            <h2>BE THERE FOR FIGHT NIGHT 3.</h2>
            <p>Reserve free General Admission for Saturday 5 December 2026 at Yerroulbin Reserve, Birchgrove. Registration is required.</p>
          </div>
          <button className="button button-red" onClick={() => go('tickets/fight-night-3')}>BOOK FREE TICKETS <ArrowRight size={16} /></button>
        </div>

        <div className="fn2-title-callout">
          <span>FOUR BOUTS CONFIRMED</span>
          <strong>ONE NIGHT. FOUR MATCHUPS.</strong>
          <p>Opening bout · Featured bout · Co-main event · Main event</p>
        </div>

        <SectionHeading kicker="AFC FIGHT NIGHT 3: MATHER VS CARROLL" title="OFFICIAL FIGHT ORDER." />
        <p className="section-lead">All four matchups are confirmed in the official running order. Select any competitor to view their AFC profile. The main event is highlighted below.</p>
        <div className="fn2-bout-list">
          {card.map((bout, index) => (
            <article className={`fn2-bout-card ${index === 3 ? 'fn2-main-event' : ''}`} key={bout.label}>
              <div className="fn2-bout-meta">
                <span>{bout.label}</span>
                <b>{bout.title}</b>
              </div>
              <div className="fn2-bout-fighters">
                <button onClick={() => go(`fighter/${bout.a}`)}><span>{fighters[bout.a].initials}</span><strong>{fighters[bout.a].name}</strong></button>
                <em>VS</em>
                <button onClick={() => go(`fighter/${bout.b}`)}><span>{fighters[bout.b].initials}</span><strong>{fighters[bout.b].name}</strong></button>
              </div>
              <div className="fn2-bout-odds">
                <span>BOUT STATUS</span>
                <b>UPCOMING · CONFIRMED</b>
              </div>
            </article>
          ))}
        </div>

        <SectionHeading kicker="THE FIGHTERS" title="FIGHT NIGHT 3 COMPETITORS." />
        <p className="section-lead">Seven competitors are confirmed across the four-bout card. Markus Goldschmitt is scheduled for two appearances.</p>
        <div className="fighter-grid">
          {(['markus', 'constantine', 'julian', 'luca', 'angus', 'rohan', 'angus-carroll'] as FighterId[]).map(id => (
            <FighterCard key={id} id={id} go={go} />
          ))}
        </div>

        <div className="standings-note">
          <Shield size={20} />
          <p><b>FIGHT NIGHT 3 · CARD CONFIRMED</b><br />Markus Goldschmitt vs Constantine Papadopolus opens the event; Julian Small vs Luca Dukovski is the featured bout; Angus McCall vs Markus Goldschmitt is the co-main event; Rohan Mather vs Angus Carroll headlines the night for the Interim Lightweight Championship.</p>
        </div>

        <SectionHeading kicker="EVENT INFORMATION" title="DATE, VENUE & ADMISSION." />
        <dl className="news-event-details">
          <div><dt>Event</dt><dd>AFC Fight Night 3: Mather vs Carroll</dd></div>
          <div><dt>Date</dt><dd>Saturday 5 December 2026</dd></div>
          <div><dt>Venue</dt><dd>Yerroulbin Reserve</dd></div>
          <div><dt>Location</dt><dd>Birchgrove, NSW</dd></div>
          <div><dt>Event start</dt><dd>To be announced</dd></div>
          <div><dt>Admission</dt><dd>Free General Admission · registration required</dd></div>
          <div><dt>Fight card</dt><dd>Four confirmed bouts · Interim Lightweight Championship main event</dd></div>
        </dl>

        <div className="ticket-map-panel fn3-map-panel">
          <div className="ticket-map-heading">
            <div><Eyebrow>EVENT LOCATION</Eyebrow><h3>YERROULBIN RESERVE.</h3><p>Yurulbin Park, Birchgrove NSW 2041.</p></div>
            <a href="https://www.openstreetmap.org/?mlat=-33.84775984681849&mlon=151.1844607151711#map=17/-33.84775984681849/151.1844607151711" target="_blank" rel="noreferrer">OPEN FULL MAP <ArrowRight size={14} /></a>
          </div>
          <div className="ticket-map-frame">
            <iframe title="Map for AFC Fight Night 3 at Yerroulbin Reserve" src="https://www.openstreetmap.org/export/embed.html?bbox=151.180%2C-33.8513%2C151.1889%2C-33.8443&layer=mapnik&marker=-33.84775984681849%2C151.1844607151711" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <p className="ticket-map-credit">Map data © OpenStreetMap contributors</p>
        </div>
        <button className="text-link back-link" onClick={() => go('events')}><ArrowLeft size={16} /> BACK TO EVENTS</button>
      </section>
    </>
  );
}

type TicketEvent = {
  slug: string;
  name: string;
  date: string;
  venue: string;
  location: string;
  status: 'open' | 'closed';
  mapAddress: string;
  mapHref: string;
  mapEmbed: string;
  mapHeading: string;
};

const ticketEvents: TicketEvent[] = [
  {
    slug: 'fight-night-3',
    name: 'AFC Fight Night 3: Mather vs Carroll',
    date: 'Saturday 5 December 2026',
    venue: 'Yerroulbin Reserve',
    location: 'Birchgrove',
    status: 'open',
    mapAddress: 'Yurulbin Park, Birchgrove NSW 2041.',
    mapHref: 'https://www.openstreetmap.org/?mlat=-33.84775984681849&mlon=151.1844607151711#map=17/-33.84775984681849/151.1844607151711',
    mapEmbed: 'https://www.openstreetmap.org/export/embed.html?bbox=151.180%2C-33.8513%2C151.1889%2C-33.8443&layer=mapnik&marker=-33.84775984681849%2C151.1844607151711',
    mapHeading: 'FIND YERROULBIN RESERVE.',
  },
];

function Tickets({ initialEventSlug = 'fight-night-3' }: { initialEventSlug?: string }) {
  const [eventSlug, setEventSlug] = useState(initialEventSlug);
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [attendeeNames, setAttendeeNames] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingReference, setBookingReference] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [confirmedNames, setConfirmedNames] = useState<string[]>([]);
  const [ticketType, setTicketType] = useState<'general-admission' | 'hospitality'>('general-admission');
  const [accommodation, setAccommodation] = useState(false);
  const [confirmedTicketType, setConfirmedTicketType] = useState('General Admission');
  const [confirmedAccommodation, setConfirmedAccommodation] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const selectedEvent = ticketEvents.find(event => event.slug === eventSlug)!;
  const count = Math.max(1, Math.min(20, Number(quantity) || 1));

  function updateQuantity(value: string) {
    setQuantity(value);
    const nextCount = Math.max(1, Math.min(20, Number(value) || 1));
    setAttendeeNames(current => Array.from({ length: nextCount }, (_, index) => current[index] ?? ''));
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const names = attendeeNames.slice(0, count).map(name => name.trim());
      if (eventSlug !== 'fight-night-3') {
        setErrorMessage('Fight Night 2 is completed and ticket registration is closed. Choose an available AFC event.');
        return;
      }
      if (ticketType !== 'general-admission' || accommodation) {
        setErrorMessage('Fight Night 3 offers General Admission only, with no accommodation add-ons.');
        return;
      }
      if (names.some(name => name.length < 2 || name.length > 100)) {
        setErrorMessage('Each attendee name must be between 2 and 100 characters.');
        return;
      }
      const suffix = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const bookingReference = `AFC-FN3-${suffix}`;
      const ticketNumber = `DEMO-03-${suffix}`;
      const selected = ticketEvents.find(item => item.slug === eventSlug)!;
      const { error: insertError } = await supabase.from('ticket_bookings').insert({
        registration_type: 'demo',
        booking_reference: bookingReference,
        ticket_number: ticketNumber,
        event_slug: selected.slug,
        event_name: selected.name,
        event_date: selected.date,
        venue: selected.venue,
        location: selected.location,
        email: email.trim(),
        quantity: count,
        ticket_type: 'general-admission',
        ticket_price: 0,
        accommodation: false,
        accommodation_hotel: null,
        accommodation_price: 0,
        total_amount: 0,
        attendee_names: names,
      });
      if (insertError) throw insertError;
      setBookingReference(bookingReference);
      setTicketNumber(ticketNumber);
      setConfirmedNames(names);
      setConfirmedTicketType(ticketType === 'hospitality' ? 'Hospitality' : 'General Admission');
      setConfirmedAccommodation(accommodation);
      setConfirmedTotal(0);
    } catch {
      setErrorMessage('We could not save your reservation. Please check each attendee name and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="tickets-page">
      <PageIntro kicker="AFC TICKETS · DEMO REGISTRATION" title="SECURE YOUR PLACE." copy="Register for AFC Fight Night 3 and save a demo registration for your group. No payment is taken." />
      <section className="wrap tickets-layout">
        <div className="ticket-event-panel">
          <div className="ticket-event-art">
            <span>APPIAN FIGHTING CHAMPIONSHIP</span>
            <b>FIGHT NIGHT<br /><em>{selectedEvent.slug === 'fight-night-3' ? '03.' : '02.'}</em></b>
            <small>{selectedEvent.slug === 'fight-night-3' ? '05.12.2026 · BIRCHGROVE' : '14.11.2026 · BREAKFAST POINT'}</small>
          </div>
          <div className="ticket-event-copy">
            <div className="ticket-event-status"><span /> TICKET BOOKINGS OPEN</div>
            <h2>{selectedEvent.name}</h2>
            <p className="ticket-event-date">{selectedEvent.date}</p>
            <p>{selectedEvent.venue} · {selectedEvent.location}</p>
            <div className="ticket-event-facts">
              <span>EVENT TIME <b>TO BE ANNOUNCED</b></span>
              <span>ADMISSION <b>FREE</b></span>
            </div>
            <p className="ticket-small-note">The full four-bout fight card is confirmed. Event start time to be announced.</p>
          </div>
          <div className="ticket-map-panel">
            <div className="ticket-map-heading">
              <div><Eyebrow>EVENT LOCATION</Eyebrow><h3>{selectedEvent.mapHeading}</h3><p>{selectedEvent.mapAddress}</p></div>
              <a href={selectedEvent.mapHref} target="_blank" rel="noreferrer">OPEN FULL MAP <ArrowRight size={14} /></a>
            </div>
            <div className="ticket-map-frame">
              <iframe title={`Map showing ${selectedEvent.venue} in ${selectedEvent.location}`} src={selectedEvent.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <p className="ticket-map-credit">Map data © OpenStreetMap contributors</p>
          </div>
        </div>
        <div className="ticket-form-panel">
          {bookingReference ? (
            <div className="ticket-success" role="status">
              <Eyebrow>DEMO REGISTRATION SAVED</Eyebrow>
              <h2>YOUR DEMO TICKET IS READY.</h2>
              <p>Your {confirmedTicketType} selection has been saved. This is a fictional AFC demo ticket and is not valid for real-world event entry.</p>
              <div className="official-ticket">
                <div className="official-ticket-top">
                  <div><strong className="ticket-brand-mark">AFC</strong><small>APPIAN FIGHTING CHAMPIONSHIP</small></div>
                  <span>DEMO ONLY</span>
                </div>
                <div className="official-ticket-event">
                  <small>DEMO REGISTRATION TICKET</small>
                  <h3>FIGHT NIGHT {selectedEvent.slug === 'fight-night-3' ? '03' : '02'}</h3>
                  <b>{confirmedTicketType.toUpperCase()}</b>
                </div>
                <div className="official-ticket-meta">
                  <div><small>DATE</small><strong>{selectedEvent.slug === 'fight-night-3' ? 'SAT · 05 DEC 2026' : 'SAT · 14 NOV 2026'}</strong></div>
                  <div><small>VENUE</small><strong>{selectedEvent.venue.toUpperCase()}</strong></div>
                  <div><small>LOCATION</small><strong>{selectedEvent.location.toUpperCase()}</strong></div>
                  <div><small>ADMIT</small><strong>{confirmedNames.length} {confirmedNames.length === 1 ? 'PERSON' : 'PEOPLE'}</strong></div>
                  {selectedEvent.slug === 'fight-night-2' && <div><small>ACCOMMODATION</small><strong>{confirmedAccommodation ? 'ALBION STREET HOTEL' : 'NOT INCLUDED'}</strong></div>}
                </div>
                <div className="official-ticket-attendees">
                  <small>REGISTERED ATTENDEES</small>
                  {confirmedNames.map((name, index) => <span key={index}>{String(index + 1).padStart(2, '0')} · {name}</span>)}
                </div>
                <div className="official-ticket-bottom">
                  <div><small>TICKET NUMBER</small><strong>{ticketNumber}</strong><small>BOOKING REF · {bookingReference}</small></div>
                  <div className="ticket-barcode" aria-label="Decorative ticket barcode" />
                </div>
                <div className="official-ticket-strip">DEMO ONLY · NOT VALID FOR REAL-WORLD ENTRY</div>
                <div className="official-ticket-total">BOOKING TOTAL <strong>${confirmedTotal}</strong></div>
              </div>
              <p className="ticket-small-note">This saved demo registration does not collect payment and does not grant real-world event entry.</p>
              <button className="button button-outline" onClick={() => {
                setBookingReference('');
                setTicketNumber('');
                setEmail('');
                setQuantity('1');
                setAttendeeNames(['']);
                setConfirmedNames([]);
                setTicketType('general-admission');
                setAccommodation(false);
                setConfirmedAccommodation(false);
                setConfirmedTotal(0);
              }}>MAKE ANOTHER BOOKING</button>
            </div>
          ) : (
            <>
              <Eyebrow>01 / SELECT YOUR EVENT</Eyebrow>
              <label htmlFor="ticket-event">EVENT</label>
              <select id="ticket-event" value={eventSlug} onChange={event => {
                setEventSlug(event.target.value);
                setTicketType('general-admission');
                setAccommodation(false);
                setErrorMessage('');
              }}>
                {ticketEvents.filter(item => item.status === 'open').map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
              <Eyebrow>02 / SELECT YOUR CATEGORY</Eyebrow>
              <h2>CHOOSE YOUR TICKET.</h2>
              <button type="button" className={`ticket-tier-card ticket-tier-choice ${ticketType === 'general-admission' ? 'ticket-tier-selected' : ''}`} onClick={() => setTicketType('general-admission')}>
                <span className="ticket-tier-radio">{ticketType === 'general-admission' && <span />}</span>
                <span className="ticket-tier-description"><strong>GENERAL ADMISSION</strong><small>Standard event admission</small><em>Free entry to {selectedEvent.name}</em></span>
                <b className="ticket-tier-price">FREE</b>
              </button>
              {eventSlug === 'fight-night-2' && (
                <>
                  <button type="button" className={`ticket-tier-card ticket-tier-choice ${ticketType === 'hospitality' ? 'ticket-tier-selected' : ''}`} onClick={() => setTicketType('hospitality')}>
                    <span className="ticket-tier-radio">{ticketType === 'hospitality' && <span />}</span>
                    <span className="ticket-tier-description"><strong>HOSPITALITY</strong><small>Premium event experience</small><em>Unlimited food from Breakfast Point IGA · padded seat</em></span>
                    <b className="ticket-tier-price">$50</b>
                  </button>
                  <p className="ticket-form-intro">Hospitality is available for $50 per attendee and includes unlimited food from Breakfast Point IGA and a padded seat.</p>
                </>
              )}
              <form className="ticket-form" onSubmit={submitBooking}>
                <Eyebrow>03 / BOOKING CONTACT</Eyebrow>
                <label htmlFor="ticket-email">BOOKING EMAIL ADDRESS</label>
                <input id="ticket-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
                {eventSlug === 'fight-night-2' && (
                  <>
                    <Eyebrow>04 / OPTIONAL ACCOMMODATION</Eyebrow>
                    <label className="ticket-addon-option">
                      <input type="checkbox" checked={accommodation} onChange={event => setAccommodation(event.target.checked)} />
                      <span><strong>ALBION STREET HOTEL</strong><small>Optional accommodation add-on · $300 per booking</small></span>
                    </label>
                    <p className="ticket-attendee-hint">Accommodation is an optional add-on and is not included in the ticket price.</p>
                  </>
                )}
                <Eyebrow>{eventSlug === 'fight-night-2' ? '05' : '04'} / ATTENDEE DETAILS</Eyebrow>
                <label htmlFor="ticket-quantity">NUMBER OF ATTENDEES</label>
                <input id="ticket-quantity" type="number" min="1" max="20" required value={quantity} onChange={event => updateQuantity(event.target.value)} />
                <p className="ticket-attendee-hint">Enter the full name of every person included in this booking.</p>
                {attendeeNames.slice(0, count).map((name, index) => (
                  <div className="ticket-attendee-field" key={index}>
                    <label htmlFor={`attendee-${index}`}>ATTENDEE {String(index + 1).padStart(2, '0')} {index === 0 ? '· LEAD ATTENDEE' : ''}</label>
                    <input id={`attendee-${index}`} type="text" maxLength={100} required value={name} onChange={event => setAttendeeNames(current => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="Full name" />
                  </div>
                ))}
                {errorMessage && <p className="ticket-error" role="alert">{errorMessage}</p>}
                <div className="ticket-price-summary"><span>ESTIMATED BOOKING TOTAL</span><strong>${(ticketType === 'hospitality' ? count * 50 : 0) + (accommodation ? 300 : 0)}</strong></div>
                <p className="ticket-payment-note">Your selection will be recorded with your booking. Online payment is not currently available, so this form does not charge you.</p>
                <button className="button button-red ticket-submit" type="submit" disabled={submitting}>
                  {submitting ? 'SAVING REGISTRATION…' : 'SAVE DEMO REGISTRATION'}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </form>
              <p className="ticket-privacy-note">Your email and attendee names are saved with this demo registration. No payment is processed, and the generated ticket is not valid for real-world entry.</p>
            </>
          )}
        </div>
      </section>
      <section className="wrap ticket-footer-note">
        <Eyebrow>MORE EVENTS TO COME</Eyebrow>
        <p>As additional AFC events are officially announced, they’ll be added to this page and made available for free ticket reservations where bookings are open.</p>
      </section>
    </div>
  );
}

function EventDetail({ go }: { go: (s: string) => void }) {
  return (
    <>
      <div className="event-detail-hero">
        <div className="wrap">
          <Eyebrow>OFFICIAL EVENT ARCHIVE · COMPLETED</Eyebrow>
          <div className="event-detail-title">
            <div>
              <h1>
                FIGHT NIGHT
                <br />
                <span>01.</span>
              </h1>
              <p>APPIAN FIGHTING CHAMPIONSHIP</p>
            </div>
            <div className="event-date-block">
              <b>19</b>
              <span>
                SEPTEMBER
                <br />
                2026
              </span>
            </div>
          </div>
          <div className="event-detail-meta">
            <span>
              VENUE <b>APPIAN ARENA</b>
            </span>
            <span>
              FORMAT <b>ROUND ROBIN + PLAYOFFS</b>
            </span>
            <span>
              COMPETITORS <b>05</b>
            </span>
          </div>
        </div>
      </div>
      <section className="wrap section-space">
        <SectionHeading kicker="STAGE ONE" title="ROUND ROBIN." />
        <p className="section-lead">
          Five competitors. Each fighter faced the other four. The following ten
          results are the official event record.
        </p>
        <div className="result-grid">
          {fights
            .filter(f => f.stage === 'Round Robin')
            .map(f => (
              <ResultCard key={f.id} fight={f} go={go} />
            ))}
        </div>
      </section>
      <section className="playoff-section section-space">
        <div className="wrap">
          <SectionHeading
            kicker="CHAMPIONSHIP PLAYOFFS"
            title="THE ROAD TO THE TITLE."
          />
          <div className="bracket">
            <div className="bracket-card">
              <span className="bracket-stage">SEMIFINAL</span>
              <div className="bracket-contest">
                <FighterLink id="rohan" go={go} />
                <b className="bracket-score">W</b>
              </div>
              <div className="bracket-contest">
                <FighterLink id="adrian" go={go} />
                <b className="bracket-score muted-text">L</b>
              </div>
              <p>Rohan Mather advances · Decision 1–0</p>
            </div>
            <div className="bracket-connector">
              <ArrowRight />
            </div>
            <div className="bracket-card bye-card">
              <span className="bracket-stage">DIRECT ADVANCEMENT</span>
              <Trophy size={24} />
              <h3>FELIX FARAH</h3>
              <strong>BYE</strong>
              <p>
                Advanced directly to the championship final. No fight or record
                entry.
              </p>
            </div>
            <div className="bracket-connector">
              <ArrowDownRight />
            </div>
            <div className="bracket-card final-card">
              <span className="bracket-stage">CHAMPIONSHIP FINAL</span>
              <div className="bracket-contest">
                <FighterLink id="felix" go={go} />
                <b className="bracket-score">W</b>
              </div>
              <div className="bracket-contest">
                <FighterLink id="rohan" go={go} />
                <b className="bracket-score muted-text">L</b>
              </div>
              <p>Felix Farah wins by submission.</p>
            </div>
          </div>
          <div className="champion-announcement">
            <Trophy size={30} />
            <div>
              <span>YOUR INAUGURAL AFC CHAMPION</span>
              <h2>FELIX FARAH</h2>
              <p>
                Crowned 19 September 2026 · Defeated Rohan Mather by submission
              </p>
            </div>
            <button
              className="button button-light"
              onClick={() => go('fighter/felix')}
            >
              CHAMPION PROFILE <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <section className="wrap section-space">
        <SectionHeading kicker="EVENT RECAP" title="A CHAMPION CROWNED." />
        <div className="recap-copy">
          <p>
            AFC Fight Night 1 brought five competitors together at Appian Arena
            for a ten-bout round robin, followed by the championship playoffs.
            The round-robin stage established the competitors’ event records,
            before Rohan Mather defeated Adrian Capolupo in the semifinal by
            decision, 1–0.
          </p>
          <p>
            Felix Farah advanced directly to the final by bye. In the
            championship bout, Farah defeated Mather by submission to become the
            inaugural Appian Fighting Championship champion.
          </p>
        </div>
        <button className="text-link" onClick={() => go('fighters')}>
          EXPLORE ALL FIVE FIGHTERS <ArrowRight size={16} />
        </button>
      </section>
    </>
  );
}
function Fighters({
  go,
  query,
  setQuery,
}: {
  go: (s: string) => void;
  query: string;
  setQuery: (s: string) => void;
}) {
  const list = (Object.keys(fighters) as FighterId[]).filter(id =>
    fighters[id].name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <>
      <PageIntro
        kicker="THE ROSTER"
        title="MEET THE FIGHTERS."
        copy="Meet the AFC roster, view fighter profiles and follow official records and upcoming championship contests."
      />
      <section className="wrap section-space">
        <div className="search-row">
          <div className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search fighters..."
              aria-label="Search fighters"
            />
          </div>
          <span>{list.length} OF {Object.keys(fighters).length} FIGHTERS</span>
        </div>
        <div className="fighter-grid directory-grid">
          {list.map(id => (
            <FighterCard key={id} id={id} go={go} />
          ))}
        </div>
        {list.length === 0 && (
          <div className="empty-state">No fighters match that search.</div>
        )}
      </section>
    </>
  );
}
function FighterProfile({
  id,
  go,
}: {
  id: FighterId;
  go: (s: string) => void;
}) {
  const history = fights.filter(f => f.a === id || f.b === id);
  const r = records[id];
  return (
    <>
      <section className="profile-hero">
        <div className="wrap profile-layout">
          <div className="profile-monogram">
            {fighters[id].initials}
            <span>AFC / 2026</span>
          </div>
          <div className="profile-heading">
            <Eyebrow>OFFICIAL FIGHTER PROFILE</Eyebrow>
            <h1>{fighters[id].name.toUpperCase()}.</h1>
            <p>
              {fighterDivisions[id] ? `${fighterDivisions[id]} Division` : 'Weight class TBA'}
              {fn2FightDivisions[id] ? ` · FN2 competing at ${fn2FightDivisions[id]}` : ''}
              {fighters[id].role ? ` · ${fighters[id].role}` : ''}
              {id === 'rohan' ? ' · Fight Night 1 Runner-up' : ''}
            </p>
            <div className="profile-record">
              {recordText(id)}
              <span>OFFICIAL AFC RECORD</span>
            </div>
            <div className="profile-details">
              <div className="profile-detail">
                <span className="profile-detail-icon" aria-hidden="true">{fighterDetails[id]?.flag || '🌍'}</span>
                <div>
                  <small>COUNTRY</small>
                  <strong>{fighterDetails[id]?.country || 'Not provided'}</strong>
                </div>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-gym" aria-hidden="true">GYM</span>
                <div>
                  <small>FIGHTS OUT OF</small>
                  <strong>{fighterDetails[id]?.gym || 'Not provided'}</strong>
                </div>
              </div>
            </div>
          </div>        </div>      </section>
      <section className="wrap section-space">
        {fn3Matchups[id] && <div className="profile-honour"><div><b>{id === 'markus' ? 'UPCOMING AFC FIGHT NIGHT 3 BOUTS' : 'UPCOMING AFC FIGHT NIGHT 3 BOUT'}</b><span>{fn3Matchups[id]}</span></div></div>}
          <div className="stats-row">
          <div>
            <b>{r.wins}</b>
            <span>WINS</span>          </div>
          <div>
            <b>{r.losses}</b>
            <span>LOSSES</span>
          </div>
          <div>
            <b>{r.nc}</b>
            <span>NO CONTESTS</span>
          </div>
          <div>
            <b>{r.total}</b>
            <span>TOTAL FIGHTS</span>
          </div>
        </div>
        {id === 'felix' && <div className="profile-honour"><Trophy /><div><b>INAUGURAL AFC WELTERWEIGHT CHAMPION</b><span>Welterweight title won by submission in the Fight Night 1 final · 19 September 2026</span></div></div>}
        {id === 'adrian' && <div className="profile-honour"><Trophy /><div><b>INAUGURAL AFC FLYWEIGHT CHAMPION</b><span>Flyweight title won by guillotine in Round 2 at AFC Fight Night 2 · 14 November 2026</span></div></div>}
        {id === 'jack' && <div className="profile-honour"><Trophy /><div><b>INAUGURAL AFC FEATHERWEIGHT CHAMPION</b><span>Featherweight title won by 48–47 split decision at AFC Fight Night 2 · 14 November 2026</span></div></div>
        }{id === 'rohan' && (
          <div className="profile-honour">
            <Award />
            <div>
              <b>FIGHT NIGHT 1 RUNNER-UP</b>
              <span>
                Defeated Adrian Capolupo in the semifinal by decision, 1–0
              </span>
            </div>
          </div>
        )}
        <SectionHeading kicker="OFFICIAL RECORD" title="FIGHT HISTORY." />
        <div className="history-list">
          {history.map(f => {
            const won = f.winner === id;
            const nc = f.method === 'No Contest';
            const opponent = f.a === id ? f.b : f.a;
            return (
              <div className="history-row" key={f.id}>
                <div
                  className={
                    won
                      ? 'history-result win'
                      : nc
                        ? 'history-result nc'
                        : 'history-result loss'
                  }
                >
                  {won ? 'W' : nc ? 'NC' : 'L'}
                </div>
                <div className="history-main">
                  <b>{fighters[opponent].name}</b>
                  <span>
                    {f.stage === 'Fight Night 2' ? 'AFC Fight Night 2' : `AFC Fight Night 1 · ${f.stage}`}
                    {f.number ? ` · Bout ${f.number}` : ''}
                  </span>
                </div>
                <div className="history-method">
                  <b>{f.method}</b>
                  <span>
                    {f.score ||
                      [f.reason, f.round ? `Round ${f.round}` : ''].filter(Boolean).join(' · ') ||
                      (f.method === 'Submission' ? 'Official result' : '')}
                  </span>
                </div>
                <button
                  className="icon-button"
                  onClick={() => go(f.stage === 'Fight Night 2' ? 'event/fight-night-2' : 'event/fight-night-1')}
                  aria-label="View event"
                >
                  <ArrowRight />
                </button>
              </div>
            );
          })}
        </div>
        <button className="text-link back-link" onClick={() => go('fighters')}>
          <ArrowLeft size={16} /> BACK TO FIGHTERS
        </button>
      </section>
    </>
  );
}
function Divisions({ go }: { go: (s: string) => void }) {
  const divisionCards: { name: 'Lightweight' | 'Heavyweight'; ids: FighterId[]; champion: FighterId; championLabel: string; note: string }[] = [
    { name: 'Lightweight', ids: divisionFighters.Lightweight, champion: 'jack', championLabel: 'LIGHTWEIGHT CHAMPION · JACK CAMPION', note: 'FORMER FLYWEIGHT + FEATHERWEIGHT' },
    { name: 'Heavyweight', ids: divisionFighters.Heavyweight, champion: 'felix', championLabel: 'HEAVYWEIGHT CHAMPION · FELIX FARAH', note: 'FORMER WELTERWEIGHT DIVISION' },
  ];
  return (
    <>
      <PageIntro
        kicker="AFC CHAMPIONSHIP STRUCTURE"
        title="WEIGHT DIVISIONS."
        copy="AFC now operates two divisions: Lightweight, formed by combining the former Flyweight and Featherweight divisions, and Heavyweight, renamed from Welterweight."
      />
      <section className="wrap section-space">
        <div className="division-intro-note">
          <Shield size={20} />
          <p><b>UPDATED DIVISION STRUCTURE · 20 NOVEMBER 2026</b><br />Flyweight and Featherweight have merged into Lightweight. Welterweight has been renamed Heavyweight. Adrian Capolupo has vacated the Flyweight title and moved to Heavyweight.</p>
        </div>
        <div className="division-grid">
          {divisionCards.map((division, index) => (
            <article className="division-card" key={division.name}>
              <div className="division-card-head">
                <span>0{index + 1} / AFC DIVISION</span>
                <b>{division.name.toUpperCase()}</b>
                <small>{division.note}</small>
              </div>
              <div className="division-card-body">
                <p className="division-card-caption">REGISTERED FIGHTERS</p>
                <p className="division-champion-note"><Trophy size={14} /> {division.championLabel}</p>
                {division.ids.map(id => (
                  <button className="division-fighter-row" key={id} onClick={() => go(`fighter/${id}`)}>
                    <span className="avatar">{fighters[id].initials}</span>
                    <strong>{fighters[id].name}{id === division.champion && <small className="division-champion-tag">{division.name.toUpperCase()} CHAMPION</small>}</strong>
                    <span>{recordText(id)}</span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="division-unassigned">
          <div>
            <Eyebrow>DIVISION ASSIGNMENT PENDING</Eyebrow>
            <h2>NOT YET ALLOCATED.</h2>
            <p>These AFC competitors have not yet had a weight class publicly confirmed.</p>
          </div>
          <div className="division-unassigned-list">
            <span><b>Orlando Maiolo</b><small>WEIGHT CLASS TBA</small></span>
          </div>
        </div>
        <div className="division-intro-note"><Shield size={20} /><p><b>CHAMPIONSHIP STATUS</b><br />Jack Campion is recognised as Lightweight Champion. Felix Farah's Welterweight title carries forward as the Heavyweight Championship following the division rename. Adrian Capolupo's Flyweight championship is recorded in title history; he has vacated the title and is now registered at Heavyweight.</p></div>
        <p className="division-disclaimer">Exact weight limits remain TBA. Fighter records are unchanged by the divisional restructure.</p>
      </section>
    </>
  );
}

function Rankings({ go }: { go: (s: string) => void }) {
  const rankingDivisions: { name: string; ids: FighterId[]; champion: FighterId }[] = [
    { name: 'Lightweight', ids: ['jack', 'byron', 'angus-carroll', 'julian', 'lachlan-cole', 'luca'], champion: 'jack' },
    { name: 'Heavyweight', ids: ['felix', 'constantine', 'markus', 'angus', 'adrian', 'rohan'], champion: 'felix' },
  ];
  const poundForPound: FighterId[] = ['felix', 'adrian', 'rohan'];

  const rankingRow = (id: FighterId, position: number, label?: string, isChampion = false) => (
    <button className="ranking-entry" key={`${id}-${position}`} onClick={() => go(`fighter/${id}`)}>
      <span className="ranking-position">{String(position).padStart(2, '0')}</span>
      <span className="ranking-fighter">
        <strong>{fighters[id].name}</strong>
        <small>{label || `${recordText(id)} · ${fighters[id].role || 'AFC competitor'}`}</small>
      </span>
      {isChampion && <span className="ranking-champion-tag">CHAMPION</span>}
      <ArrowRight size={17} />
    </button>
  );

  return (
    <>
      <PageIntro
        kicker="OFFICIAL AFC RANKINGS"
        title="THE RANKINGS."
        copy="The official Appian Fighting Championship rankings across Lightweight and Heavyweight, plus an exclusive pound-for-pound top three."
      />
      <section className="wrap section-space">
        <div className="ranking-champ">
          <div>
            <Eyebrow>REIGNING HEAVYWEIGHT CHAMPION</Eyebrow>
            <h2>FELIX FARAH</h2>
            <p>His Welterweight championship carries forward following the division rename · Crowned 19 September 2026</p>
          </div>
          <Trophy size={48} />
        </div>

        <SectionHeading kicker="OFFICIAL DIVISION ORDER" title="DIVISION RANKINGS." />
        <p className="section-lead">Each division is ranked independently. Select a fighter to view their official AFC profile.</p>
        <div className="ranking-grid">
          {rankingDivisions.map((division, index) => (
            <section className="ranking-panel" key={division.name}>
              <div className="ranking-panel-head">
                <span>0{index + 1} / AFC DIVISION</span>
                <h2>{division.name.toUpperCase()}</h2>
                <small>OFFICIAL RANKINGS</small>
              </div>
              <div className="ranking-entries">
                {division.ids.map((id, position) => rankingRow(id, position + 1, undefined, id === division.champion))}
              </div>
            </section>
          ))}
        </div>

        <section className="p4p-panel">
          <div className="p4p-heading">
            <div>
              <Eyebrow>ACROSS ALL DIVISIONS</Eyebrow>
              <h2>POUND FOR POUND.</h2>
              <p>The three highest-ranked fighters across AFC, regardless of division.</p>
            </div>
            <span>TOP 03</span>
          </div>
          <div className="ranking-entries p4p-entries">
            {poundForPound.map((id, position) => rankingRow(id, position + 1, undefined, id === 'felix'))}
          </div>
          <div className="p4p-note">
            <Shield size={18} />
            <p><b>TOP THREE ONLY</b><br />The AFC Pound-for-Pound list recognises only these three fighters. All other fighters are not ranked in the Pound-for-Pound list.</p>
          </div>
        </section>

        <div className="standings-note">
          <Shield size={20} />
          <p>
            <b>RANKINGS & RECORDS</b>
            <br />Rankings show AFC’s official order within each division. Fighter records are displayed on individual profiles and remain separate from ranking positions.
          </p>
        </div>
        <SectionHeading kicker="TITLE HISTORY" title="CHAMPIONSHIP HISTORY." />
        <div className="title-history"><span>001</span><div><b>FELIX FARAH</b><p>Inaugural AFC Welterweight Champion · Reclassified as Heavyweight Champion · AFC Fight Night 1 · 19 September 2026</p></div><button className="text-link" onClick={() => go('fighter/felix')}>PROFILE <ArrowRight size={15} /></button></div>
        <div className="title-history"><span>002</span><div><b>ADRIAN CAPOLUPO</b><p>Inaugural AFC Flyweight Champion · Vacated 20 November 2026 · AFC Fight Night 2 · 14 November 2026</p></div><button className="text-link" onClick={() => go('fighter/adrian')}>PROFILE <ArrowRight size={15} /></button></div>
        <div className="title-history"><span>003</span><div><b>JACK CAMPION</b><p>Inaugural AFC Featherweight Champion · Recognised as Lightweight Champion · AFC Fight Night 2 · 14 November 2026</p></div><button className="text-link" onClick={() => go('fighter/jack')}>PROFILE <ArrowRight size={15} /></button></div>
      </section>
    </>
  );
}
function News({ go }: { go: (s: string) => void }) {
  return (
    <>
      <PageIntro
        kicker="THE AFC NEWSROOM"
        title="NEWS & MEDIA."
        copy="Official announcements, event recaps and stories from Appian Fighting Championship. Every story stays in the archive as new announcements are added."
      />
      <section className="wrap section-space news-archive">
        <div className="news-archive-heading">
          <div>
            <Eyebrow>THE LATEST</Eyebrow>
            <h2>ALL AFC STORIES.</h2>
          </div>
          <span>{newsStories.length.toString().padStart(2, '0')} STORIES</span>
        </div>
        <div className="news-story-list">
          {newsStories.map((story, index) => (
            <button
              className="news-story-card"
              key={story.slug}
              onClick={() => go(`news/${story.slug}`)}
            >
              <div className="news-story-number">{String(newsStories.length - index).padStart(2, '0')}</div>
              <div className="news-story-main">
                <div className="news-story-meta">
                  <span>{story.category}</span>
                  <time>{story.date}</time>
                </div>
                <h2>{story.title}</h2>
                <p>{story.deck}</p>
                <span className="news-story-read">READ FULL STORY <ArrowRight size={15} /></span>
              </div>
              <span className="news-story-arrow"><ArrowRight /></span>
            </button>
          ))}
        </div>
        <p className="news-archive-note">The newsroom archive is retained as new stories are published.</p>
      </section>
    </>
  );
}

function NewsStory({ story, go }: { story: NewsStory; go: (s: string) => void }) {
  return (
    <>
      <PageIntro
        kicker="THE AFC NEWSROOM"
        title="OFFICIAL STORY."
        copy="Announcements and updates from Appian Fighting Championship."
      />
      <article className="wrap news-article">
        <div className="news-article-top">
          <span className="news-category">{story.category}</span>
          <time>{story.date}</time>
        </div>
        <div className="news-article-hero">
          <div className="news-article-art">
            <span>A F C</span>
            <b>{story.artLabel}</b>
            <small>{story.artSubline}</small>
          </div>
          <div className="news-article-heading">
            <Eyebrow>OFFICIAL AFC ANNOUNCEMENT</Eyebrow>
            <h2>{story.title}</h2>
            <p className="news-article-deck">{story.deck}</p>
          </div>
        </div>
        <div className="news-article-body">
          {story.sections.map((section, index) => (
            <section key={index}>
              {section.heading && <h3>{section.heading}</h3>}
              {section.paragraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}
          <h3>AGREEMENT & ANNOUNCEMENT DETAILS</h3>
          <dl className="news-event-details">
            {story.details.map(detail => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
          <div className="news-article-signoff">
            <b>APPIAN FIGHTING CHAMPIONSHIP</b>
            <em>Bringing the fights to the people.</em>
            <strong>AFC. THE FIGHT CONTINUES.</strong>
          </div>
        </div>
        <button className="text-link back-link" onClick={() => go('news')}>
          <ArrowLeft size={16} /> BACK TO ALL NEWS
        </button>
      </article>
    </>
  );
}
function About({ go }: { go: (s: string) => void }) {
  return (
    <>
      <PageIntro
        kicker="WHO WE ARE"
        title="ABOUT AFC."
        copy="An independent grappling promotion built around competition, discipline and the pursuit of a championship."
      />
      <section className="wrap about-content">
        <div className="about-statement">
          <span>01 / THE PROMOTION</span>
          <h2>
            BUILT AROUND
            <br />
            <em>COMPETITION.</em>
          </h2>
        </div>
        <div className="about-copy">
          <p>
            Appian Fighting Championship is an independent grappling promotion
            built around competition, discipline and the pursuit of a
            championship.
          </p>
          <p>
            Bringing together a dedicated roster of competitors, AFC creates
            structured contests that reward technical ability, determination and
            composure under pressure.
          </p>
          <p>
            From round-robin competition to championship playoffs, every matchup
            contributes to the story of the promotion.
          </p>
          <p>
            The inaugural AFC champion was crowned at Appian Arena on 19
            September 2026, when Felix Farah defeated Rohan Mather in the
            championship final.
          </p>
          <div className="about-links">
            <button
              onClick={() =>
                document
                  .getElementById('rules')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              COMPETITION RULES <ArrowRight />
            </button>
            <button onClick={() => go('event/fight-night-1')}>
              FIGHT NIGHT 1 ARCHIVE <ArrowRight />
            </button>
            <button onClick={() => go('fighters')}>
              FIGHTER DIRECTORY <ArrowRight />
            </button>
          </div>
        </div>
      </section>
      <section className="rules-section" id="rules">
        <div className="wrap">
          <SectionHeading kicker="THE COMPETITION" title="AFC RULES." />
          <div className="rules-grid">
            <div>
              <b>02:00</b>
              <span>STANDARD MATCH DURATION</span>
            </div>
            <div>
              <b>01</b>
              <span>SUBMISSION OR JUDGES’ DECISION</span>
            </div>
            <div>
              <b>02</b>
              <span>JUDGES DECIDE IF NO SUBMISSION</span>
            </div>
            <div>
              <b>REF</b>
              <span>REFEREE BREAKS A JUDGES’ DRAW</span>
            </div>
          </div>
          <div className="rules-list">
            <div>
              <span>01</span>
              <p>Competition focuses on Brazilian jiu-jitsu and wrestling.</p>
            </div>
            <div>
              <span>02</span>
              <p>Standard matches last two minutes.</p>
            </div>
            <div>
              <span>03</span>
              <p>Takedowns and submissions are permitted.</p>
            </div>
            <div>
              <span>04</span>
              <p>Punches and kicks are not permitted.</p>
            </div>
            <div>
              <span>05</span>
              <p>
                If neither fighter submits the other within two minutes, two
                judges decide the result.
              </p>
            </div>
            <div>
              <span>06</span>
              <p>
                If the judges produce a draw, the referee acts as the
                tiebreaker.
              </p>
            </div>
          </div>
          <p className="rules-footnote">
            At AFC Fight Night 1, the Rohan Mather vs Orlando Maiolo bout
            resulted in a disqualification due to punching.
          </p>
        </div>
      </section>
    </>
  );
}
function NotFound({ go }: { go: (s: string) => void }) {
  return (
    <section className="wrap not-found">
      <Eyebrow>404 / NOT FOUND</Eyebrow>
      <h1>
        THIS PAGE
        <br />
        IS OUT OF BOUNDS.
      </h1>
      <button className="button button-red" onClick={() => go('home')}>
        RETURN HOME <ArrowRight />
      </button>
    </section>
  );
}
function Footer({ go }: { go: (s: string) => void }) {
  return (
    <footer className="footer">
      <div className="wrap footer-main">
        <div>
          <a className="brand footer-brand" href={href('home')}>
            <span className="brand-mark">AFC</span>
            <span className="brand-caption">
              APPIAN FIGHTING
              <br />
              CHAMPIONSHIP
            </span>
          </a>
          <p>BUILT THROUGH COMPETITION.</p>
        </div>
        <div className="footer-nav">
          {['home', 'events', 'tickets', 'fighters', 'divisions', 'rankings', 'news', 'about'].map(
            p => (
              <button key={p} onClick={() => go(p)}>
                {p.toUpperCase()}
              </button>
            )
          )}
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} APPIAN FIGHTING CHAMPIONSHIP</span>
        <span>INDEPENDENT GRAPPLING PROMOTION</span>
      </div>
    </footer>
  );
}
export default App;
