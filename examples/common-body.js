
document.write(`
<article>
<script>
    coursemeta.writeArticleHeader()
    coursemeta.writeDesc();
</script>
</article>
<article>
<div class="centered">
    <div class="cell-block-clear">
        <div id="project" class="centered"></div>
    </div>
    <div class="cell-block-light" style="width: 384px">
        <h5 onclick='toggle(" controls")'>Controls</h5>
        <div id="controls"></div>
    </div>
</div>

<div class="cell-block-clear">
    <!-- Write your main description here -->
    <h5 onclick='toggle("desc")'>Description &amp; Notes</h5>
    <p id="desc">This example shows basic usage of the LibXOR library.</p>
</div>

<h5 onclick='toggle("log")'>Log</h5>
<div id='log' class='log'>Log items here...</div>

<footer>
    <hr class="goldhr" />
</footer>
</article>
<article>
<script>
    coursemeta.writeArticleFooter();
</script>
</article>
`)
