import { cloneTemplate } from "../lib/utils.js";
import { initTable } from "./modules/table.js";
import { initPagination } from "./modules/pagination.js";
/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */

function collectState(form) {
  const formData = new FormData(form);
  const state = Object.fromEntries(formData.entries());

  // Приводим значения к нужным типам
  const rowsPerPage = parseInt(state.rowsPerPage); // количество строк на страницу
  const page = parseInt(state.page ?? 1); // номер страницы по умолчанию 1

  return {
    ...state,
    rowsPerPage,
    page,
  };
}

// Инициализация таблицы
const sampleTable = initTable(
  {
    tableTemplate: "table-template",
    rowTemplate: "row-template",
    after: ["pagination"],
  },
  (action) => {
    console.log("Action:", action);
  },
);

// @todo: инициализация
const applyPagination = initPagination(
  sampleTable.pagination.elements,
  (el, page, isCurrent) => {
    const input = el.querySelector("input");
    const label = el.querySelector("span");
    input.value = page;
    input.checked = isCurrent;
    label.textContent = page;
    return el;
  },
);

// @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
if (before && Array.isArray(before)) {
  [...before].reverse().forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.prepend(root[subName].container);
  });
}

// Добавляем шаблоны "после" таблицы
if (after && Array.isArray(after)) {
  after.forEach((subName) => {
    root[subName] = cloneTemplate(subName);
    root.container.append(root[subName].container);
  });
}

// @todo: #1.3 —  обработать события и вызвать onAction()
// Обработчик события change
root.container.addEventListener("change", () => {
  onAction();
});

// Обработчик события reset
root.container.addEventListener("reset", () => {
  setTimeout(() => {
    onAction();
  }, 0);
});

// Обработчик события submit
root.container.addEventListener("submit", (e) => {
  e.preventDefault();
  onAction(e.submitter);
});

const render = (data) => {
  // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
  const nextRows = data.map((item) => {
    const row = cloneTemplate(rowTemplate);
    Object.keys(item).forEach((fieldName) => {
      const cell = row.querySelector(`[data-field="${fieldName}"]`);
      if (cell) {
        cell.textContent = item[fieldName];
      }
    });

    return row;
  });

  root.elements.rows.replaceChildren(...nextRows);
};
