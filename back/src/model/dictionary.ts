import { request } from 'undici';
import { parse } from 'node-html-parser';

export type DefinitionType = {
  type: string;
  definition: (string | {
    type: string;
    definition: string[];
  })[];
}

export type RefType = {
  def: string;
  synonyms: string[];
}

export type IdiomType = {
  idiom: string;
  form?: string;
  definition: string[];
  example: string[];
  label?: string;
}

export type WordExplainType = {
  definitions: DefinitionType[];
  ref: RefType[];
  use: string[];
  idioms: IdiomType[];
}

export class Dictionary {
  constructor() {
  }

  async explain(word: string): Promise<WordExplainType> {
    const response = await request('https://www.dictionary.com/browse/' + word);
    const body = await response.body.text();
    const html = parse(body);
    const defsHtml = html.querySelectorAll('[data-type="luna-definitions"] [data-type="word-definition-card"] [data-type="word-definitions"]');
    const definitions = defsHtml.map(e => {
      return {
        type: e.childNodes[0].rawText,
        definition: e.querySelectorAll('ol>li').map(e => {
          if (e.childNodes.length === 1) {
            return e.text;
          }
          return {
            type: e.childNodes[0].rawText,
            definition: e.childNodes[1].childNodes[0].parentNode.querySelectorAll('[data-type="word-definition-content"]').map(e => e.text)
          }
        })
      }
      
    });
    const refHtml = html.querySelector('#preloaded-state')?.text;
    let ref;
    if (refHtml) {
      const w: any = {};
      Function('window', refHtml)(w);
      ref = w['__PRELOADED_STATE__']['tuna']['resultsData']['definitionData']['definitions'].map(e => ({ def: e['definition'], synonyms: e['synonyms'].map(e => e['term']) }))
    }
    const useHtml = html.querySelectorAll('[data-type="example-sentences-section"] li>p');
    const use = useHtml.map(e => e.text);

    const idiomsHtml = html.querySelectorAll('[data-type="idioms-about-word"] ol>li');
    const idioms = idiomsHtml.map(e => ({
      idiom: e.querySelector('.luna-idiom')?.text || '',
      form: e.querySelector('.luna-form')?.text,
      definition: e.querySelectorAll('p').map(e => e.childNodes.filter(e => e.nodeType === 3).map(e => e.text).join('').replace(/(^[ ,.:]+|[ .,:]+$)/g, '')).filter(e => e),
      example: e.querySelectorAll('.luna-example').map(e => e.text),
      label: e.querySelector('.luna-label')?.text
    }));

    return {
      definitions,
      ref,
      use,
      idioms
    };
  }
}
