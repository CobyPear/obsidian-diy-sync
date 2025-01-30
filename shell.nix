let
  unstable = import <nixos-unstable> {};
in
{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    # nativeBuildInputs is usually what you want -- tools you need to run
    packages =  [
      pkgs.nodejs_22
      pkgs.openssl
      unstable.pnpm
      pkgs.sqlite
      pkgs.podman-compose
      pkgs.sqlitebrowser
    ];
}
