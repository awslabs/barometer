for p in platforms/*/; do
  for f in "${p}"functions/*/; do
    echo "==> zipping function from path: $f"
    rm "$f"code.zip
    zip -r -j "$f"code.zip "$f"*
  done
done