CREATE TABLE [Categories] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [RevokedTokens] (
    [Id] int NOT NULL IDENTITY,
    [Token] nvarchar(max) NOT NULL,
    [RevokedAt] datetime2 NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [UserId] int NOT NULL,
    [Reason] nvarchar(max) NULL,
    CONSTRAINT [PK_RevokedTokens] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Users] (
    [Id] int NOT NULL IDENTITY,
    [Username] nvarchar(max) NOT NULL,
    [Email] nvarchar(450) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [DeletedAt] datetime2 NULL,
    [ProfileImageUrl] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [Address] nvarchar(max) NULL,
    [Bio] nvarchar(max) NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Auctions] (
    [Id] int NOT NULL IDENTITY,
    [Title] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [StartPrice] decimal(18,2) NOT NULL,
    [CurrentPrice] decimal(18,2) NOT NULL,
    [StartTime] datetime2 NOT NULL,
    [EndTime] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [SellerId] int NOT NULL,
    [CategoryId] int NULL,
    [Status] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Auctions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Auctions_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_Auctions_Users_SellerId] FOREIGN KEY ([SellerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Notifications] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [Type] nvarchar(max) NOT NULL,
    [Title] nvarchar(max) NOT NULL,
    [Message] nvarchar(max) NULL,
    [IsRead] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [RelatedEntityId] int NULL,
    [Metadata] nvarchar(max) NULL,
    CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AuctionImages] (
    [Id] int NOT NULL IDENTITY,
    [AuctionId] int NOT NULL,
    [Url] nvarchar(max) NOT NULL,
    [IsPrimary] bit NOT NULL,
    [DisplayOrder] int NOT NULL,
    CONSTRAINT [PK_AuctionImages] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AuctionImages_Auctions_AuctionId] FOREIGN KEY ([AuctionId]) REFERENCES [Auctions] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Bids] (
    [Id] int NOT NULL IDENTITY,
    [AuctionId] int NOT NULL,
    [BidderId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [Timestamp] datetime2 NOT NULL,
    CONSTRAINT [PK_Bids] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Bids_Auctions_AuctionId] FOREIGN KEY ([AuctionId]) REFERENCES [Auctions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Bids_Users_BidderId] FOREIGN KEY ([BidderId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Transactions] (
    [Id] int NOT NULL IDENTITY,
    [AuctionId] int NOT NULL,
    [BuyerId] int NOT NULL,
    [Amount] decimal(18,2) NOT NULL,
    [PaymentStatus] int NOT NULL,
    [OrderDate] datetime2 NOT NULL,
    [PaidDate] datetime2 NULL,
    [ShippedDate] datetime2 NULL,
    [CompletedDate] datetime2 NULL,
    [ShippingAddress] nvarchar(max) NULL,
    [TrackingNumber] nvarchar(max) NULL,
    [ShippingMethod] nvarchar(max) NULL,
    [BuyerNotes] nvarchar(max) NULL,
    [AdminNotes] nvarchar(max) NULL,
    [CreatedAt] datetime2 NOT NULL,
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_Transactions] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Transactions_Auctions_AuctionId] FOREIGN KEY ([AuctionId]) REFERENCES [Auctions] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Transactions_Users_BuyerId] FOREIGN KEY ([BuyerId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
);
GO


CREATE TABLE [Watchlists] (
    [Id] int NOT NULL IDENTITY,
    [UserId] int NOT NULL,
    [AuctionId] int NOT NULL,
    [AddedDate] datetime2 NOT NULL,
    CONSTRAINT [PK_Watchlists] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Watchlists_Auctions_AuctionId] FOREIGN KEY ([AuctionId]) REFERENCES [Auctions] ([Id]),
    CONSTRAINT [FK_Watchlists_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_AuctionImages_AuctionId] ON [AuctionImages] ([AuctionId]);
GO


CREATE INDEX [IX_Auctions_CategoryId] ON [Auctions] ([CategoryId]);
GO


CREATE INDEX [IX_Auctions_SellerId] ON [Auctions] ([SellerId]);
GO


CREATE INDEX [IX_Bids_AuctionId] ON [Bids] ([AuctionId]);
GO


CREATE INDEX [IX_Bids_BidderId] ON [Bids] ([BidderId]);
GO


CREATE INDEX [IX_Notifications_CreatedAt] ON [Notifications] ([CreatedAt]);
GO


CREATE INDEX [IX_Notifications_IsRead] ON [Notifications] ([IsRead]);
GO


CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
GO


CREATE INDEX [IX_Transactions_AuctionId] ON [Transactions] ([AuctionId]);
GO


CREATE INDEX [IX_Transactions_BuyerId] ON [Transactions] ([BuyerId]);
GO


CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
GO


CREATE INDEX [IX_Watchlists_AuctionId] ON [Watchlists] ([AuctionId]);
GO


CREATE UNIQUE INDEX [IX_Watchlists_UserId_AuctionId] ON [Watchlists] ([UserId], [AuctionId]);
GO


