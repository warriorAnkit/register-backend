// const CONFIG = require('../../../config/config');
// const { generateS3PublicUrl } = require('../../../shared-lib/aws/functions/generate-get-signed-url');

// const { publicBucketName } = CONFIG.aws.bucket;
// const maxStringLength = 42;

const generateReportHeaderFooter = async () => {
//   const logo = tenant.logo ? await generateS3PublicUrl(tenant.logo, publicBucketName, false) : null;
//   const tenantName = tenant?.organizationName?.length > maxStringLength ? `${tenant.organizationName.slice(0, maxStringLength)}...` : tenant?.organizationName;
  // console.log("hiii");
  //    console.log(configuration.digiQCBranding);
  //    console.log(configuration);

  const projectLogoContent = `
  <img
    src='https://digiqc-staging-public.s3.ap-south-1.amazonaws.com/digiqc-logos/digiqc-log0-192x64.png'
    alt="logo"
    style="
    height:'40px';
    max-width:'960px';
    
      backface-visibility: hidden;
      transform: translateZ(0);
      image-rendering: crisp-edges;
    "
  />
`;
  const footerContent = `
  <footer class="footer">
    <div>
      <table frame="hsides" style="width: 100%; margin-top: 16px; border: none; table-layout: fixed">
        <tbody>
          <tr>
              <td style="padding: 10px; width: 25%">
                <img style="
                  width: 50px;
                  backface-visibility: hidden;
                  transform: translateZ(0);
                  image-rendering: crisp-edges;
                "
                src="https://digiqc-staging-public.s3.ap-south-1.amazonaws.com/digiqc-logos/digiqc-log0-192x64.png"
                alt="logo" />
              </td>
              <td style="padding: 0px; text-align: center; width: 25%">
                <p style="margin: 0; font-size: 8px;font-weight: 450">Digitize.Monitor.Improve</p>
              </td>
              <td style="text-align: right; padding: 10px; width: 25%">
                <p style="margin: 0; font-size: 8px;font-weight: 450">digiqc.com</p>
                <div style="font-size: 8px; font-weight: 350;">
                  <span class="pageNumber">{{getPageNumber @index}}</span> / <span class="totalPages">{{getTotalPages
                    ../$pdf.pages}}</span>
                </div>
              </td>
              
            
          </tr>
        </tbody>
      </table>
    </div>
  </footer>
`;

  const headerFooterString = `
    <html>
      <head>
        <style>
          * {
            box-sizing: border-box;
           
          }
      
          html,
          body {
            margin: 0px 5px 0px;
            padding: 0px;
            font-family: 'Inter', sans-serif;
          }
      
          .main {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 100%;
            height: 100%;
          }
      
          .header {
            width: 100%;
            padding-top: 10px;
            border-bottom: 0px solid black;
           
          }
      
          .footer {
            width: 100%;
            padding-bottom: 10px;
            border-top: 0px solid black;
          }
        </style>
      </head>
    
      <body>
        {{#each $pdf.pages}}
        {{#if @index}}
        <div style="page-break-before: always;"></div>
        {{/if}}
        <main class="main">
          <header class="header">
            <div>
              <table frame="hsides" style="width: 100%; border: none; table-layout: fixed">
                <tbody>
                  <tr>
                    <td style="padding: 10px; width: 68%">
                      ${projectLogoContent}
                    </td>
                    <td style="padding: 0px; text-align: center; width: 2%">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </header>
      
          ${footerContent}
      
        </main>
        {{/each}}
      </body>
    </html>`;

  const getPageNumber = `          
    function getPageNumber (pageIndex) {
      if (pageIndex == null) {
          return ''
      }
      const pageNumber = pageIndex + 1
      return pageNumber
    }

    function getTotalPages (pages) {
      if (!pages) {
          return ''
      }
      return pages.length
    }
  `;

  return { headerFooterString, getPageNumber };
};

module.exports = { generateReportHeaderFooter };
