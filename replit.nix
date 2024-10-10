{ pkgs }: {
  deps = [
    pkgs.nodejs-20 # Node.js (use whichever version you prefer)
    pkgs.npm           # NPM for installing Firebase tools
  ];
}