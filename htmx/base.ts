function getHtmxBase(children: string) {
  return /*html*/ `
<html>
    <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/picnic">
    <style>
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1); /* Light gray border */
            border-left-color: #3498db; /* Blue color for the spinning part */
            border-radius: 50%; /* Makes it a circle */
            width: 30px; /* Adjust size as needed */
            height: 30px;
            animation: spin 1s linear infinite; /* Animation properties */
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg); /* Start at 0 degrees */
            }
            100% {
                transform: rotate(360deg); /* End at 360 degrees */
            }
        }
    </style>
    </head>
    <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/htmx-ext-ws@2.0.2" crossorigin="anonymous"></script>
    <body 
    hx-ext="ws"
    style="max-width: 600px; margin: 0 auto; padding: 2rem;">
        ${children}
    </body>
</html>
`;
}

export default getHtmxBase;
