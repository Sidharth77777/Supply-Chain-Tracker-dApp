// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Supply Chain Tracker Contract
/// @author Sidharth K S
/// @notice Tracks shipments, payments, and withdrawals between buyer and seller in a decentralized way
/// @dev GitHub: https://github.com/Sidharth77777

contract SupplyChainTracker {
    
    uint256 public shipmentCount; // Total shipments created

    constructor() {
        shipmentCount = 0;
    }

    /// @notice Possible shipment states
    enum ShipmentStatus { CREATED, DISPATCHED, ON_ROUTE, DELIVERED, CANCELLED }

    /// @notice Events for frontend tracking
    event ShipmentCreated(uint256 shipmentId, address indexed seller, address indexed buyer, uint256 price);
    event ShipmentDispatched(uint256 shipmentId, address indexed seller, uint256 timestamp);
    event ShipmentOnRoute(uint256 shipmentId, address indexed seller, uint256 timestamp);
    event ShipmentDelivered(uint256 shipmentId, address indexed buyer, uint256 timestamp);
    event ShipmentCancelled(uint256 shipmentId, address indexed user);
    event ShipmentPaid(uint256 shipmentId, address indexed buyer, address indexed seller, uint256 amount);
    event FundWithdrawn(uint256 shipmentId, address indexed seller);

    /// @notice Shipment data structure
    struct Shipment {
        uint256 id;
        address payable seller;
        address payable buyer;
        uint256 pickUpTime;
        uint256 dispatchTime;
        uint256 onRouteTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    /// @notice Mapping of shipment ID to Shipment struct
    mapping(uint256 => Shipment) public shipments;

    /// @notice Tracks whether seller has withdrawn funds for a shipment
    mapping(address => mapping(uint256 => bool)) public withdrawnFundsBySeller;

    // ========================================================
    // SHIPMENT LIFECYCLE FUNCTIONS
    // ========================================================

    /// @notice Create a shipment (only seller)
    function createShipment(address payable _buyer, uint256 _pickUpTime, uint256 _distance, uint256 _price) external {
        shipmentCount++;
        shipments[shipmentCount] = Shipment({
            id: shipmentCount,
            seller: payable(msg.sender),
            buyer: _buyer,
            pickUpTime: _pickUpTime,
            dispatchTime: 0,
            onRouteTime: 0,
            deliveryTime: 0,
            distance: _distance,
            price: _price,
            status: ShipmentStatus.CREATED,
            isPaid: false
        });

        emit ShipmentCreated(shipmentCount, msg.sender, _buyer, _price);
    }

    /// @notice Dispatch shipment (only seller)
    function dispatchShipment(uint256 _shipmentId) external {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.seller, "Only seller can dispatch !");
        require(shipment.status == ShipmentStatus.CREATED, "Shipment must be CREATED !");

        shipment.status = ShipmentStatus.DISPATCHED;
        shipment.dispatchTime = block.timestamp;

        emit ShipmentDispatched(_shipmentId, msg.sender, block.timestamp);
    }

    /// @notice Mark shipment as on route (only seller)
    function markOnRoute(uint256 _shipmentId) external {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.seller, "Only seller can update !");
        require(shipment.status == ShipmentStatus.DISPATCHED, "Shipment must be DISPATCHED !");

        shipment.status = ShipmentStatus.ON_ROUTE;
        shipment.onRouteTime = block.timestamp;

        emit ShipmentOnRoute(_shipmentId, msg.sender, block.timestamp);
    }

    /// @notice Complete shipment delivery (only seller)
    function completeShipment(uint256 _shipmentId) external {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.seller, "Only seller can complete !");
        require(shipment.status == ShipmentStatus.ON_ROUTE, "Shipment must be ON_ROUTE !");

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveryTime = block.timestamp;

        emit ShipmentDelivered(_shipmentId, shipment.buyer, block.timestamp);
    }

    // ========================================================
    // PAYMENT FUNCTIONS
    // ========================================================

    /// @notice Pay for shipment (only buyer)
    function payShipment(uint256 _shipmentId) external payable {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.buyer, "Only buyer can pay !");
        require(!shipment.isPaid, "Already paid !");
        require(shipment.status != ShipmentStatus.CANCELLED, "Cannnot pay for cancelled shipment !");
        require(msg.value == shipment.price, "Must send exact shipment price !");

        shipment.isPaid = true;

        emit ShipmentPaid(_shipmentId, msg.sender, shipment.seller, shipment.price);
    }

    /// @notice Cancel shipment (buyer or seller)
    function cancelShipment(uint256 _shipmentId) external {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.buyer || msg.sender == shipment.seller, "Only buyer or seller can cancel !");
        require(
            shipment.status == ShipmentStatus.CREATED ||
            shipment.status == ShipmentStatus.DISPATCHED ||
            shipment.status == ShipmentStatus.ON_ROUTE,
            "Cannot cancel after delivery !"
        );

        if (shipment.isPaid) {
            (bool refundSuccess, ) = shipment.buyer.call{value: shipment.price}("");
            require(refundSuccess, "Refund failed !");
            shipment.isPaid = false;
        }

        shipment.status = ShipmentStatus.CANCELLED;

        emit ShipmentCancelled(_shipmentId, msg.sender);
    }

    /// @notice Withdraw funds for delivered shipment (only seller)
    function withdrawFund(uint256 _shipmentId) external {
        Shipment storage shipment = shipments[_shipmentId];
        require(msg.sender == shipment.seller, "Only seller can withdraw !");
        require(shipment.isPaid, "Not paid yet !");
        require(shipment.status == ShipmentStatus.DELIVERED, "Shipment not delivered !");
        require(!withdrawnFundsBySeller[msg.sender][_shipmentId], "Already withdrawn !");

        (bool success, ) = shipment.seller.call{value: shipment.price}("");
        require(success, "Withdrawal failed !");

        withdrawnFundsBySeller[msg.sender][_shipmentId] = true;
        emit FundWithdrawn(_shipmentId ,shipment.seller);
    }

    // ========================================================
    // FALLBACK / RECEIVE
    // ========================================================

    /// @notice Prevent accidental ETH transfers
    receive() external payable {
        revert("Send funds via payShipment()");
    }

    fallback() external payable {
        revert("Send funds via payShipment()");
    }


    // ========================================================
    // GET FUNCTIONS
    // ========================================================

    /// @notice GET TOTAL SHIPMENTS
    function getTotalShipmentCounts() external view returns(uint256) {
        return shipmentCount;
    }

    /// @notice GET ALL SHIPMENTS
    function getAllShipments() external view returns (Shipment[] memory) {
        Shipment[] memory allShipments = new Shipment[](shipmentCount);
        for (uint256 i = 1; i <= shipmentCount; i++) {
            allShipments[i-1] = shipments[i];
        }
        return allShipments;
    }

    /// @notice GET SHIPMENT BY ID
    function getShipmentById(uint256 _shipmentId) external view returns (Shipment memory) {
        return shipments[_shipmentId];
    }

    /// @notice GET SHIPMENTS OF BUYER
    function getShipmentsOfBuyer() external view returns (Shipment[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= shipmentCount; i++) {
            if (shipments[i].buyer == msg.sender) {
                count++;
            }
        }

        Shipment[] memory result = new Shipment[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= shipmentCount; i++) {
            if (shipments[i].buyer == msg.sender) {
                result[index] = shipments[i];
                index++;
            }
        }
        return result;
    }

    /// @notice GET SHIPMENTS OF SELLER
    function getShipmentsOfSeller() external view returns (Shipment[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= shipmentCount; i++) {
            if (shipments[i].seller == msg.sender) {
                count++;
            }
        }

        Shipment[] memory result = new Shipment[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= shipmentCount; i++) {
            if (shipments[i].seller == msg.sender) {
                result[index] = shipments[i];
                index++;
            }
        }
        return result;
    }

}
