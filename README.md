# Příklad ke školení „CSS kód: Organizace a údržba“

https://www.vzhurudolu.cz/kurzy/css-kod

**Autor:** Martin Michálek, martin@vzhurudolu.cz

## Instalace projektu

Ověřte si, zda v příkazové řádce máte:

- [Git](https://git-scm.com/downloads): `git --version`
- [NPM a celý Node.js ekosystém](https://www.vzhurudolu.cz/prirucka/node-instalace): `npm --version`
- [Grunt CLI](https://gruntjs.com/getting-started): `grunt --version`

Instalujte konkrétní projekt:

```bash
# Naklonování projektu
git clone https://github.com/machal/example-css-architecture.git

# Skok do adresáře
cd example-css-architecture

# Instalace závislostí
npm install

# Spuštění Gruntu - otevře okno prohlížeče s projektem
grunt
```

## Možnosti práce s Gruntem na tomto příkladu

```bash
# Spuštění všeho: less, postcss, browserSync, watch
# (otevře okno s prohlížečem a čeká na změny v souborech)
grunt

# Stylelint - kontroluje LESS soubory
grunt stylelint

# Prettier - automaticky formátuje LESS (nebo JS) soubory
grunt prettier
```

Kompletní je možné prohlédnout si v `Gruntfile.js`.

Více informací o Gruntu: https://www.vzhurudolu.cz/prirucka/grunt
