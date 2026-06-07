import { getPages } from "../lib/utils.js";
import { initPagination } from "./modules/pagination.js";
import { cloneTemplate } from "../lib/utils.js";
import { initTable } from "./modules/table.js";
import { initSorting } from "./modules/sorting.js";
export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage,
) => {
  function collectState(form) {
    const formData = new FormData(form);
    const state = Object.fromEntries(formData.entries());

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
      ...state,
      rowsPerPage,
      page,
    };
  }

  // Инициализация таблицы с header и пагинацией
  const sampleTable = initTable(
    {
      tableTemplate: "table-template",
      rowTemplate: "row-template",
      before: ["header"],
      after: ["pagination"],
    },
    (action) => {
      console.log("Action:", action);
    },
  );

  // @todo: инициализация пагинации
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

  // @todo: инициализация сортировки
  const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal,
  ]);

  // Пример функции обновления данных
  async function updateData(action, state) {
    let result = await getRawData();

    // @todo: использование
    // Применяем модули в правильном порядке
    result = applySorting(result, state, action);
    result = applyPagination(result, state, action);

    return result;
  }

  // Пример обработчика событий
  function onAction(action) {
    const form = document.querySelector("form");
    const state = collectState(form);

    updateData(action, state).then((filteredData) => {
      sampleTable.render(filteredData);
    });
  }

  // @todo: #2.3 — подготовить шаблон кнопки для страницы и очистить контейнер
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  return (data, state, action) => {
    // @todo: #2.1 — посчитать количество страниц, объявить переменные и константы
    const rowsPerPage = state.rowsPerPage;
    const pageCount = Math.ceil(data.length / rowsPerPage);
    let page = state.page;

    // @todo: #2.6 — обработать действия
    if (action)
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          page = Math.min(pageCount, page + 1);
          break;
        case "first":
          page = 1;
          break;
        case "last":
          page = pageCount;
          break;
      }

    // @todo: #2.4 — получить список видимых страниц и вывести их
    const visiblePages = getPages(page, pageCount, 5);
    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === page);
      }),
    );

    // @todo: #2.5 — обновить статус пагинации
    fromRow.textContent = (page - 1) * rowsPerPage + 1;
    toRow.textContent = Math.min(page * rowsPerPage, data.length);
    totalRows.textContent = data.length;

    // @todo: #2.2 — посчитать сколько строк нужно пропустить и получить срез данных
    const skip = (page - 1) * rowsPerPage;
    return data.slice(skip, skip + rowsPerPage);
    return data.slice(0, 10);
  };
};
