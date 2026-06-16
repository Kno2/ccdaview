import { Document } from './document';
import { Preferences } from './preferences';
import { Section } from './section';

export class ViewerOptions {
    public sections: Array<Section>;
    public data: unknown;
    public pref: Preferences;
    public documents?: Array<Document>;
}
