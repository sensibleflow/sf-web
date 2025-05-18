# sensible flow

## What is it?

Accessible navigation of websites, moreover expandable to desktops. Exquisitly suited for screenreader users.

## How to use?

- e to go to editor mode
- a to append some text, i to insert some text
- text ending with a colon is a key value combination, without a colon is a string array element
- escape to escape to editor mode
- v to go to visitor mode

Navigating elements happens with the arrow keys (or hjkl for screenreader users):

- right goes one layer to the right, only possible when a colon is present
- left goes one layer to the left, to the parent of current layer
- up and down goes up and down in current layer

Try out: [sensibleflow.com](https://sensibleflow.com)

In editor mode you can also append en insert elements: ctrl+i, Ctrl+a or enter  
Deleting an element is ctrl+d

In both modes a tab shows the list of the current layer  
Ctrl+f to find  
: for commands

Ctrl+xcv  
Ctrl(+shift)+z

## Reach out:

[discord](https://discord.gg/NnUP6Y6v)

## Based on Nuxt UI Starter

Look at [Nuxt docs](https://nuxt.com/docs/getting-started/introduction) and [Nuxt UI docs](https://ui.nuxt.com) to learn more.

### Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

### Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
