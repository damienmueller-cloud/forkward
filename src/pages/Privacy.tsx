import { Link } from 'react-router-dom'
import { alcoholDisclaimer } from '../data/swaps'

export function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="eyebrow text-violet">Privacy</p>
      <h1 className="font-display mt-2 text-4xl text-navy">
        Private by default
      </h1>
      <div className="prose-forkward mt-8 space-y-6 text-sm leading-relaxed text-navy/80">
        <p>
          Forkward is built as a practical, privacy-first companion for food
          choices and conceptual visual studies. This MVP runs in your browser.
        </p>

        <h2 className="font-display text-xl text-navy">Pantry Lens</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Kitchen photos you select stay in the browser session for this MVP.
            They are not uploaded to a Forkward server.
          </li>
          <li>
            You confirm (and can edit) draft ingredients before recipes are
            generated.
          </li>
          <li>
            Closing or refreshing the tab clears in-memory photo previews.
            Photos are never written to localStorage.
          </li>
          <li>
            Optional meal prefs (culture, recipe intent, dietary notes, avoid
            list, confirmed ingredient chips) may be saved under{' '}
            <code>forkward.pantry-context.v1</code>. Use{' '}
            <strong>Forget pantry context</strong> on Pantry Lens to wipe them
            if you shared a device.
          </li>
        </ul>

        <h2 className="font-display text-xl text-navy">Reflect AI studio</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Mirror photos are processed locally in-browser for the conceptual
            after preview.
          </li>
          <li>
            Consents (18+, my photo) are required before generating a study.
          </li>
          <li>
            Studies are educational visualisations — not medical diagnoses,
            predictions, or treatment plans.
          </li>
        </ul>

        <h2 className="font-display text-xl text-navy">What we do not do (MVP)</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>No Facebook or Instagram account setup from this app.</li>
          <li>No account login required to try Pantry Lens or Reflect.</li>
          <li>No sale of your photos.</li>
        </ul>

        <h2 className="font-display text-xl text-navy">Alcohol</h2>
        <p className="disclaimer text-navy">{alcoholDisclaimer}</p>

        <p>
          Questions about this rebuild: treat Forkward (forkward.com.au) as the
          hero brand;{' '}
          <Link className="font-bold text-violet underline" to="/reflect">
            Reflect AI
          </Link>{' '}
          remains a separate product route.
        </p>
      </div>
    </div>
  )
}
