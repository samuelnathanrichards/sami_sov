SAMI Galaxy Survey - Single Object View
=======================================

### To do:

* ~~fix code to read current data format.~~

* ~~scale y axis on spectrum to min = 0, max = maximum scalar between B and R of that spectrum.~~

* ~~keep zoom on spectrum when going between spaxels.~~

* ~~Remove blobs on spec graph on high zoom~~

* ~~include reset on spectrum.~~

* include the gama_sersic image array at the bottom of the page, hyperlinked to the gama_url.

* ~~use matplotlib_colormaps.json for the colormaps.~~
    * ~~SFR: YlOrRd~~
    * ~~Vel: RdYlBu, possibly RdYlBu_r, such that negative is blue~~
    * ~~Vel_dis: YlOrRd~~
    * ~~BPT_class: - 0 [0,0,0] - 1 [255,255,204] - 2 [161,218,180] - 3 [65,182,196] - 4 [34,94,168]~~
    * ~~nii_ha: YlOrRd~~
    * ~~oiii_ha: YlGnBu~~
    * ~~colorbars to have slider marker with physical value printed~~

* ~~BPT scatter to have xlims [-1.5,0.5] nii_ha, and ylims [-1.2,1.2] oiii_hb~~

* investigate performance

* perhaps have a toggle that fixes max to the maximum scalar across all spaxels?

* BPT scatter points to be greyed initially, red for selected spaxel, BPT_class colors for spaxels within psf radius.

* include aperture binning: sum all spaxels within a user defined aperture (fractional pixels if possible).

* cursor to have circle of user defined aperture size (default is psf size).

* make printable page format such that data is contained on a 2 page pdf, with hyperlinks back to sov and data download. 