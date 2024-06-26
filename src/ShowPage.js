import { Component } from "react";
import { IconArrowsSort } from "@tabler/icons-react";
import { pdf } from "@react-pdf/renderer";
import { v4 as uuidv4 } from "uuid";
import monkeysArr from "./monkeysArr";
import groupsArr from "./groupsArr";
import MonkeyCard from "./MonkeyCard";
import MonkeyPDF from "./MonkeyPDF";
import Modal from "./Modal";
import Nav from "./Nav";
import "./ShowPage.css";

class ShowPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            monkeys: monkeysArr.sort((a, b) => a.name.localeCompare(b.name)),
            selectedMonkey: null,
            prevMonkey: null,
            nextMOnkey: null,
            yearsArr: [],
            sortNameAscending: true,
            sortTroopAscending: false,
            sortYearAscending: false,
            currentTroopFilter: "All Troops",
            currentYearFilter: "All Years",
            searchValue: "",
            isModalOpen: false,
            isPDFModalOpen: false,
            isGeneratingPDF: false,
            currentPage: 1,
            monkeysPerPage: 100,
        };
        this.sortByName = this.sortByName.bind(this);
        this.sortByTroop = this.sortByTroop.bind(this);
        this.sortByYear = this.sortByYear.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.togglePDFModal = this.togglePDFModal.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleShowMore = this.handleShowMore.bind(this);
        this.handlePrevNext = this.handlePrevNext.bind(this);
    }
    updateYearsArr() {
        const currYear = new Date().getFullYear();
        const yearsArr = [];
        for (let i = currYear; i >= currYear - 30; i--) {
            yearsArr.push(i);
        }
        this.setState({
            yearsArr: yearsArr,
        });
    }
    sortByName() {
        if (!this.state.sortNameAscending) {
            this.setState({
                monkeys: this.state.monkeys.sort((a, b) =>
                    a.name.localeCompare(b.name)
                ),
                sortNameAscending: true,
                sortTroopAscending: false,
                sortYearAscending: false,
            });
        } else {
            this.setState({
                monkeys: this.state.monkeys.sort((b, a) =>
                    a.name.localeCompare(b.name)
                ),
                sortNameAscending: false,
                sortTroopAscending: false,
                sortYearAscending: false,
            });
        }
    }
    sortByTroop() {
        if (!this.state.sortTroopAscending) {
            this.setState({
                monkeys: this.state.monkeys.sort((a, b) =>
                    a.troop.localeCompare(b.troop)
                ),
                sortTroopAscending: true,
                sortNameAscending: false,
                sortYearAscending: false,
            });
        } else {
            this.setState({
                monkeys: this.state.monkeys.sort((b, a) =>
                    a.troop.localeCompare(b.troop)
                ),
                sortTroopAscending: false,
                sortNameAscending: false,
                sortYearAscending: false,
            });
        }
    }
    sortByYear() {
        if (!this.state.sortYearAscending) {
            this.setState({
                monkeys: this.state.monkeys.sort((a, b) => a.year - b.year),
                sortYearAscending: true,
                sortTroopAscending: false,
                sortNameAscending: false,
            });
        } else {
            this.setState({
                monkeys: this.state.monkeys.sort((b, a) => a.year - b.year),
                sortYearAscending: false,
                sortTroopAscending: false,
                sortNameAscending: false,
            });
        }
    }
    filterTroops = (event) => {
        const selectedTroopFilter = event.target.value;
        let filteredMonkeys;

        // run new troop filter
        if (selectedTroopFilter === "All Troops") {
            filteredMonkeys = monkeysArr.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        } else {
            filteredMonkeys = monkeysArr.filter((monkey) =>
                monkey.troop
                    .toLowerCase()
                    .includes(selectedTroopFilter.toLowerCase())
            );
        }

        // check current year filter
        if (this.state.currentYearFilter === "All Years") {
            filteredMonkeys = filteredMonkeys.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        } else {
            filteredMonkeys = filteredMonkeys.filter(
                (monkey) => monkey.year === Number(this.state.currentYearFilter)
            );
        }

        this.setState((prevState) => ({
            monkeys: filteredMonkeys,
            currentTroopFilter: selectedTroopFilter,
            searchValue: "",
        }));
    };
    filterYear = (event) => {
        const selectedYearFilter = event.target.value;
        let filteredMonkeys;

        // run new year filter
        if (selectedYearFilter === "All Years") {
            filteredMonkeys = monkeysArr.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        } else {
            filteredMonkeys = monkeysArr.filter(
                (monkey) => monkey.year === Number(selectedYearFilter)
            );
        }

        // check for troop filter
        if (this.state.currentTroopFilter === "All Troops") {
            filteredMonkeys = filteredMonkeys.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        } else {
            filteredMonkeys = filteredMonkeys.filter((monkey) =>
                monkey.troop
                    .toLowerCase()
                    .includes(this.state.currentTroopFilter.toLowerCase())
            );
        }

        this.setState((prevState) => ({
            monkeys: filteredMonkeys,
            currentYearFilter: selectedYearFilter,
            searchValue: "",
        }));
    };
    handleSearch(event) {
        const searchValue = event.target.value.toLowerCase();
        this.setState(
            () => ({ searchValue }),
            () => {
                const { searchValue } = this.state;
                if (searchValue === "") {
                    this.setState({ monkeys: monkeysArr });
                } else if (!isNaN(searchValue)) {
                    const results = monkeysArr.filter((monkey) =>
                        monkey.chip.toString().includes(searchValue.toString())
                    );
                    this.setState({ monkeys: results });
                } else {
                    const results = monkeysArr.filter((monkey) =>
                        monkey.name
                            .toLowerCase()
                            .includes(searchValue.trim().toLowerCase())
                    );
                    this.setState({ monkeys: results });
                }
            }
        );
    }
    handleDelete() {
        this.setState({
            searchValue: "",
            monkeys: monkeysArr,
        });
    }
    updatePrevNextMonkeys() {
        const { monkeys, selectedMonkey } = this.state;
        const selectedIndex = monkeys.findIndex(
            (monkey) => monkey === selectedMonkey
        );
        const prevMonkey = monkeys[selectedIndex - 1] || null;
        const nextMonkey = monkeys[selectedIndex + 1] || null;
        this.setState((st) => ({
            prevMonkey: prevMonkey,
            nextMonkey: nextMonkey,
        }));
    }
    setIndexes(m) {
        this.setState({ selectedMonkey: m }, this.updatePrevNextMonkeys);
    }
    toggleModal(m) {
        this.setIndexes(m);
        this.setState((st) => ({
            isModalOpen: !st.isModalOpen,
        }));
    }
    handlePrevNext(direction) {
        const { prevMonkey, nextMonkey } = this.state;
        if (direction === "prev" && prevMonkey) {
            this.setState(
                { selectedMonkey: prevMonkey },
                this.updatePrevNextMonkeys
            );
        } else if (direction === "next" && nextMonkey) {
            this.setState(
                { selectedMonkey: nextMonkey },
                this.updatePrevNextMonkeys
            );
        }
    }
    togglePDFModal(m) {
        console.log("pdf modal requested");
        this.setState((st) => ({
            isPDFModalOpen: !st.isPDFModalOpen,
        }));
    }
    //PDF function from react-pdf
    createPDF = async () => {
        this.setState({ isGeneratingPDF: true });
        const { monkeys } = this.state;
        const blob = await pdf(<MonkeyPDF monkeys={monkeys} />).toBlob();
        const url = URL.createObjectURL(blob);

        const filename = "profile_book";
        const newTab = window.open(url, "_blank");
        //filename currently not applying
        newTab.window.document.title = filename;
        this.setState({ isGeneratingPDF: false });
    };
    componentDidMount() {
        this.updateYearsArr();
    }
    handleShowMore() {
        this.setState((prevState) => ({
            currentPage: prevState.currentPage + 1,
        }));
    }
    render() {
        const { currentPage, monkeysPerPage } = this.state;
        const indexOfLastMonkey = currentPage * monkeysPerPage;
        const currentMonkeys = this.state.monkeys.slice(0, indexOfLastMonkey);

        return (
            <div className="ShowPage">
                <div className="ShowPage-modal">
                    <Modal
                        onClose={this.toggleModal}
                        isModalOpen={this.state.isModalOpen}
                        monkey={this.state.selectedMonkey}
                        handlePrevNext={this.handlePrevNext}
                        prevMonkey={this.state.prevMonkey}
                        nextMonkey={this.state.nextMonkey}
                    />
                </div>
                <div className="ShowPage-nav">
                    <Nav
                        createPDF={this.createPDF}
                        isGeneratingPDF={this.state.isGeneratingPDF}
                        searchValue={this.state.searchValue}
                        handleSearch={this.handleSearch}
                        handleDelete={this.handleDelete}
                        isPDFModalOpen={this.state.isPDFModalOpen}
                        togglePDFModal={this.togglePDFModal}
                    />
                </div>
                <div className="ShowPage-sortfilter">
                    <div className="ShowPage-sort">
                        <h4>Sort:</h4>
                        <button onClick={this.sortByName}>
                            <span>Name </span>
                            <IconArrowsSort />
                        </button>
                        <button onClick={this.sortByTroop}>
                            <span>Troop </span>
                            <IconArrowsSort />{" "}
                        </button>
                        <button onClick={this.sortByYear}>
                            <span>Year </span>
                            <IconArrowsSort />{" "}
                        </button>
                    </div>
                    <div className="ShowPage-filter">
                        <h4>Filter:</h4>
                        <select
                            className="ShowPage-filter-select"
                            name="troops"
                            id="troops"
                            value={this.state.currentTroopFilter}
                            onChange={this.filterTroops}
                        >
                            {groupsArr.map((g, index) => (
                                <option key={`group-${index}`} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                        <select
                            className="ShowPage-filter-select"
                            name="year"
                            id="year"
                            value={this.state.currentYearFilter}
                            onChange={this.filterYear}
                        >
                            <option value="All Years">All Years</option>
                            {this.state.yearsArr.map((y, index) => (
                                <option key={`year-${index}`} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="ShowPage-monkeys">
                    {currentMonkeys.map((m, index) => (
                        <div
                            key={uuidv4()}
                            onClick={() => this.toggleModal(m, index)}
                        >
                            <MonkeyCard
                                name={m.name}
                                sex={m.sex}
                                year={m.year}
                                troop={m.troop}
                                img={m.img[0]}
                            />
                        </div>
                    ))}
                </div>
                {indexOfLastMonkey < this.state.monkeys.length && (
                    <div className="ShowPage-showMore">
                        <button
                            className="ShowPage-showMoreBtn"
                            onClick={this.handleShowMore}
                        >
                            Show More
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default ShowPage;
