import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "vSRHLSnhXPN2bbN2JSTJtR",  // ID of a project you are using
      token: "OnRY6RLHeTV7ndRcb7UDfpHlgAxy7MtZ35jhF1xJBjSfHso6IyUoJcmAFyT3G994ZnZ2jLjji0mEPNPYTdOg"  // API token for that project
    }
  ],
  // Fetches the latest revisions, whether or not they were unpublished!
  // Disable for production to ensure you render only published changes.
  preview: true,
})
