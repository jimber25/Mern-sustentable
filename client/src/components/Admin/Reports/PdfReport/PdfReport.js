import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PERIODS } from "../../../../utils";
import {
  convertDangerousFieldsEngToEsp,
  convertEffluentFieldsEngToEsp,
  convertEnergyFieldsEngToEsp,
  convertFormsEngToEsp,
  convertKPIsFieldsEngToEsp,
  convertPeriodsEngToEsp,
  convertProductionFieldsEngToEsp,
  convertSiteFieldsEngToEsp,
  convertWasteFieldsEngToEsp,
  convertWaterFieldsEngToEsp,
} from "../../../../utils/converts";
import {
  dangerousCodes,
  effluentCodes,
  energyCodes,
  energyFieldMain,
  kpisCodes,
  kpisFieldMain,
  productionCodes,
  siteCodes,
  wasteCodes,
  waterCodes,
} from "../../../../utils/codes";
import { Productionform } from "../../../../api";
import { useAuth } from "../../../../hooks";
const productionFormController = new Productionform();

export async function reportPdfByYear(data, module, year) {
  const determineKeys = (a) => {
    switch (a) {
      case "siteform":
        return siteCodes;
      case "energyform":
        return energyCodes;
      case "productionform":
        return productionCodes;
      case "effluentform":
        return effluentCodes;
      case "waterform":
        return waterCodes;
      case "wasteform":
        return wasteCodes;
      case "kpisform":
        return kpisCodes;
      case "dangerousform":
        return dangerousCodes;
      default:
        return null;
    }
  };

  const determineConvertModule = (module, data) => {
    switch (module) {
      case "siteform":
        return convertSiteFieldsEngToEsp(data);
      case "energyform":
        return convertEnergyFieldsEngToEsp(data);
      case "productionform":
        return convertProductionFieldsEngToEsp(data);
      case "effluentform":
        return convertEffluentFieldsEngToEsp(data);
      case "waterform":
        return convertWaterFieldsEngToEsp(data);
      case "wasteform":
        return convertWasteFieldsEngToEsp(data);
      case "kpisform":
        return convertKPIsFieldsEngToEsp(data);
      case "dangerousform":
        return convertDangerousFieldsEngToEsp(data);
      default:
        return null;
    }
  };

  // Determinar los campos únicos y si tienen código
  const determineFields = () => {
    const fields = new Set();

    Object.keys(determineKeys(module)).forEach((key) => {
      fields.add(key);
    });

    return Array.from(fields);
  };

  // Retorna el código
  const hasCode = (field) => {
    return determineKeys(module)[field];
  };

  // Obtener todos los campos únicos 
  const uniqueFields = determineFields();

  let uniqueMainFields = [];

  if (module === "energyform") {
    uniqueMainFields = energyFieldMain;
  } else if (module === "kpisform") {
    uniqueMainFields = kpisFieldMain;
  }


  const calculateTotalAndAverage = (field) => {
    const values = data.map((item) =>
      item[field]
        ? item[field].value && Number.isFinite(item[field].value)
          ? item[field].value
          : 0
        : 0
    );
    const total = values.reduce((acc, val) => acc + val, 0);
    const average = values.length ? total / values.length : 0;
    total.toFixed(2);
    average.toFixed(2);
    return { total, average };
  };

  const dataByPeriods = (field, data) => {
    return PERIODS.map((period) => {
      const item = data.find((d) => d.period === period);
      console.log(item && item[field] ? item[field].value + field : "nada");
      return {
        content:
          item && item[field]
            ? item[field].value
              ? item[field].value
              : "-"
            : "-",
        styles: { valign: "middle", halign: "center" },
      };
    });
  };

  const dataByPeriodsSubFields = (fieldMain, field, data) => {
    return PERIODS.map((period) => {
      const item = data.find((d) => d.period === period);
      console.log(item, item && item[fieldMain][field] ? item[fieldMain][field].value + field : "nada");
      return {
        content:
          item && item[fieldMain][field]
            ? item[fieldMain][field].value
              ? item[fieldMain][field].value
              : "-"
            : "-",
        styles: { valign: "middle", halign: "center" },
      };
    });
  };

  const formatDataFields = () => {
    return uniqueFields.map((field) => {
      return [
        {
          content: determineKeys(module)[field],
          styles: { valign: "middle", halign: "center" },
        },
        {
          content: determineConvertModule(module, field),
          styles: { valign: "middle", halign: "center" },
        },
        { content: "-", styles: { valign: "middle", halign: "center" } },
        ...dataByPeriods(field, data),
        {
          content: calculateTotalAndAverage(field).total,
          styles: { valign: "middle", halign: "center" },
        },
        {
          content: calculateTotalAndAverage(field).average,
          styles: { valign: "middle", halign: "center" },
        },
      ];
    });
  };


  const formatDataSubfield = (fieldMain) => {

    return uniqueFields.map((field) => {
          return [
            {
              content: determineKeys(module)[field],
              styles: { valign: "middle", halign: "center" },
            },
            {
              content: determineConvertModule(module, field),
              styles: { valign: "middle", halign: "center" },
            },
            { content: "-", styles: { valign: "middle", halign: "center" } },
            ...dataByPeriodsSubFields(fieldMain,field, data),
            {
              content: calculateTotalAndAverage(field).total,
              styles: { valign: "middle", halign: "center" },
            },
            {
              content: calculateTotalAndAverage(field).average,
              styles: { valign: "middle", halign: "center" },
            },
          ];
        })
    
  };

  const formatDataMainField=(fieldMain)=>{
      return [
        {
          content: determineConvertModule(module, fieldMain),
          colSpan: 17,
          //rowSpan: 17,
          styles: {
            valign: "middle",
            fillColor: [244, 247, 249],
            fontStyle: "bold",
          },
        },
      ]
  }

  const dataFinal=()=>{
    if(module==="kpisform" || module ==="energyform"){
      let list=[];
      uniqueMainFields.map(main=>{
        let a=formatDataMainField(main);
        let b=formatDataSubfield(main)
        list.push(a)
        list=list.concat(b)
        return true;
     })
     console.log(list)
     return list;
    }else{
      return formatDataFields()
    }
  }

  const listPeriods = [];

  const periodsList = PERIODS.map((p) => {
    listPeriods.push({
      content: convertPeriodsEngToEsp(p),
      colSpan: 1,
      styles: {
        valign: "middle",
        fillColor: [244, 247, 249],
        fontStyle: "bold",
      },
    });
  });

  listPeriods.push({
    content: "Total",
    colSpan: 1,
    styles: {
      valign: "middle",
      fillColor: [244, 247, 249],
      fontStyle: "bold",
    },
  });

  listPeriods.push({
    content: "Porcentaje",
    colSpan: 1,
    styles: {
      valign: "middle",
      fillColor: [244, 247, 249],
      fontStyle: "bold",
    },
  });

  const generatePdf = () => {
    let doc = new jsPDF("l", "pt", "a4", true);
    const totalPaginas = "{total_pages_count_string}";
    const pagActual = 0;
    const pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    doc.setFont("arial", "bold");
    doc.setFontSize(16);
    doc.text(
      "REPORTE " + convertFormsEngToEsp(module).toLocaleUpperCase(),
      pageWidth / 2,
      50,
      null,
      null,
      "center"
    );
    doc.text("AÑO " + year, pageWidth / 2, 70, null, null, "center");

    doc.autoTable({
      startY: 100,
      head: [
        [
          {
            content: "",
            colSpan: 17,
            styles: { halign: "center", fillColor: [43, 130, 158] },
          },
        ],
      ],
      body: [
        [
          {
            content: "Codigo",
            colSpan: 1,
            rowSpan: 2,
            styles: {
              valign: "middle",
              fillColor: [244, 247, 249],
              fontStyle: "bold",
            },
          },
          {
            content: "Item",
            colSpan: 1,
            rowSpan: 2,
            styles: {
              valign: "middle",
              fillColor: [244, 247, 249],
              fontStyle: "bold",
            },
          },
          {
            content: "Unidades",
            colSpan: 1,
            rowSpan: 2,
            styles: {
              valign: "middle",
              fillColor: [244, 247, 249],
              fontStyle: "bold",
            },
          },
          {
            content: "Periodo Reporte " + year,
            colSpan: 14,
            styles: {
              valign: "middle",
              fillColor: [244, 247, 249],
              fontStyle: "bold",
              halign: "center",
            },
          },
          //{ content: "CODE", colSpan: 4, styles: { valign: "middle" } }
        ],
        listPeriods,
        ...dataFinal()
        ,
      ],
      columnStyles: {
        0: { cellWidth: 40 },
        fontSize: 5,
      },
      bodyStyles: {
        lineWidth: 0.2,
        lineColor: [73, 138, 159],
        fontSize: 8,
      },
      theme: "grid",
      tableLineColor: [255, 255, 255],
      tableLineWidth: 1,
    });

    const primera_tabla = doc.lastAutoTable.finalY;
    // doc.autoTable({
    //   head: [
    //     [
    //       {
    //         content: "ACCIÓN TÉCNICA / COORDINATIVA",
    //         styles: { halign: "center", fillColor: [244, 247, 249] }
    //       },
    //       {
    //         content: "INTENCIÓN TÁCTICA / PRINCIPIO COLECTIVO",
    //         styles: { halign: "center", fillColor: [244, 247, 249] }
    //       }
    //     ]
    //   ],
    //   styles: {
    //     lineColor: [73, 138, 159],
    //     lineWidth: 0.2
    //   },
    //   theme: "plain",
    //   startY: primera_tabla
    // });

    if (typeof doc.putTotalPages === "function") {
      doc.putTotalPages(totalPaginas);
    }

    doc.setFontSize(8);
    const pages = doc.internal.getNumberOfPages();
    doc.setProperties({
      title: "Report",
    });

    for (let j = 1; j < pages + 1; j++) {
      let horizontalPos = pageWidth / 2; //Can be fixed number
      let verticalPos = pageHeight - 10; //Can be fixed number
      doc.setPage(j);
      doc.text(`${j} de ${pages}`, horizontalPos, verticalPos, {
        align: "center", //Optional text styling});
      });
    }

    doc.output("dataurlnewwindow");
  };

  return generatePdf();
}
