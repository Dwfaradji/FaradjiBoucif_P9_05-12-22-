/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor, within} from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import {bills} from "../fixtures/bills.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import {formatDate} from "../app/format.js";

jest.mock("../app/Store", () => mockedStore);


describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            const windowIcon = screen.getByTestId("icon-window");
            await waitFor(() => windowIcon);
            expect(windowIcon).toHaveClass("active-icon"); //TODO 5
        });

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({
                data: bills.map((bill) => ({...bill}))
            });
            const dates = screen.getAllByTestId("billDates")
            const displayedDates = []
            dates.forEach((date) => {
                displayedDates.push(date.innerHTML)
            })
            const expectedSortedDate = [
                formatDate(bills[1].date),
                formatDate(bills[3].date),
                formatDate(bills[2].date),
                formatDate(bills[0].date)
            ]
            expect(displayedDates).toEqual(expectedSortedDate)
        });

        // -------------------------------------------------------- //

        test("The bills should be completed ", () => {
            document.body.innerHTML = BillsUI({
                data: bills,
            });

            const types = screen.getAllByTestId("billTypes")
            const names = screen.getAllByTestId("billNames")
            const amounts = screen.getAllByTestId("billAmounts")
            const status = screen.getAllByTestId("billStatus")
            const columns = screen.getAllByTestId("colum-test")

            const expectColum = columns.length
            const expectRow = bills.length

            expect(expectColum).toBe(4)
            expect(expectRow).toBe(4)

            const typeBill = []
            const nameBill = []
            const amountBill = []
            const statusBill = []

            bills.forEach(bill => {
                typeBill.push(bill.type)
                nameBill.push(bill.name)
                amountBill.push(bill.amount.toString() + " €")
                statusBill.push(bill.status)
            })

            const expectValueBillType = []
            types.forEach((type) => {
                const valueBillType = type.innerHTML
                expectValueBillType.push(valueBillType)
            })
            const expectValueBillName = []
            names.forEach((name) => {
                const valueBillName = name.innerHTML
                expectValueBillName.push(valueBillName)
            })
            const expectValueBillAmount = []
            amounts.forEach((amount) => {
                const valueBillAmount = amount.innerHTML
                expectValueBillAmount.push(valueBillAmount)
            })
            const expectValueBillStatus = []
            status.forEach((statu) => {
                const valueBillStatu = statu.innerHTML
                expectValueBillStatus.push(valueBillStatu)
            })

            expect(expectValueBillType).toEqual(typeBill)
            expect(expectValueBillName).toEqual(nameBill)
            expect(expectValueBillAmount).toEqual(amountBill)
            expect(expectValueBillStatus).toEqual(statusBill)
        })


        describe("When I click on New Bill Button", () => {
            test("Then I should be sent on New Bill form", () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname});
                };

                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                    })
                );
                const bills = new Bills({
                    document,
                    onNavigate,
                    store: mockedStore,
                    localStorage: window.localStorage,
                });

                document.body.innerHTML = BillsUI({data: bills});

                const buttonNewBill = screen.getByRole("button", {
                    name: /nouvelle note de frais/i,
                });
                const handleClickNewBill = jest.fn(bills.handleClickNewBill);
                buttonNewBill.addEventListener("click", handleClickNewBill);
                userEvent.click(buttonNewBill);
                const expectStringAfterClick = screen.getByText("Envoyer une note de frais")

                expect(expectStringAfterClick).toBeInTheDocument()
            });
        });

        describe("When I click on one eye icon", () => {
            test("Then a modal should open", async () => {
                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({pathname});
                };
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Employee",
                    })
                );
                const billsPage = new Bills({
                    document,
                    onNavigate,
                    store: mockedStore,
                    localStorage: window.localStorage,
                });

                document.body.innerHTML = BillsUI({data: bills});
                const iconEyes = screen.getAllByTestId("icon-eye");
                const element = iconEyes[1]

                const modale = document.getElementById("modaleFile");
                const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
                $.fn.modal = jest.fn(() => modale.classList.add("show")); //mock de la modale Bootstrap

                element.addEventListener("click", () => handleClickIconEye(element));
                fireEvent.click(element);

                const billUrl = element.getAttribute("data-bill-url")
                const billUrlJustificatif = document.querySelector("img")
                const expectFileDocument = billUrlJustificatif.getAttribute("src")
                const modal = screen.getByText("Justificatif")

                expect(modal).toBeInTheDocument()
                expect(modale).toBeInTheDocument()
                expect(billUrl).toEqual(expectFileDocument)
            });
        });

        describe("When I went on Bills page and it is loading", () => {
            test("Then, Loading page should be rendered", () => {
                document.body.innerHTML = BillsUI({loading: true});
                expect(screen.getByText("Loading...")).toBeVisible();
                document.body.innerHTML = "";
            });
        });

        describe("When I am on Bills page but back-end send an error message", () => {
            test("Then, Error page should be rendered", () => {
                document.body.innerHTML = BillsUI({error: "error message"});
                expect(screen.getByText("Erreur")).toBeVisible();
                document.body.innerHTML = "";
            });
        });

        //TODO 6 test d'intégration GET
        describe("When I navigate to Bills Page", () => {
            test("Then fetches bills from mock API GET", async () => {
                jest.spyOn(mockedStore, "bills");
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                localStorage.setItem(
                    "user",
                    JSON.stringify({type: "Employee", email: "a@a"})
                );

                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.append(root);
                router();
                window.onNavigate(ROUTES_PATH.Bills);

                await waitFor(() => screen.getByText("Mes notes de frais"));

                const newBillBtn = await screen.findByRole("button", {
                    name: /nouvelle note de frais/i,
                });
                const billsTableRows = screen.getByTestId("tbody");

                expect(newBillBtn).toBeTruthy();
                expect(billsTableRows).toBeTruthy();
                expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4);
            });

            test("Then fetches bills from an API and fails with 404 message error", async () => {

                mockedStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });

            test("fetches messages from an API and fails with 500 message error", async () => {
                mockedStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Bills);
                await new Promise(process.nextTick);
                const message = screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});
